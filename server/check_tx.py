import os
import sqlite3
import time
from dotenv import load_dotenv
from web3 import Web3
from hexbytes import HexBytes

load_dotenv()

MANTLE_RPC_LIST = os.getenv("NODE_HTTP_LIST", "").split(",")
if not MANTLE_RPC_LIST or MANTLE_RPC_LIST[0] == "":
    raise Exception("❌ ERROR: Node list is empty!")

def connect_to_node():
    for rpc in MANTLE_RPC_LIST:
        rpc = rpc.strip()
        if not rpc:
            continue
        try:
            web3_instance = Web3(Web3.HTTPProvider(rpc))
            if web3_instance.is_connected():
                print(f"✅ Node connected: {rpc}")
                return web3_instance
        except Exception:
            print(f"⚠️ Node {rpc} not respond. Reconnect...")
    raise Exception("❌ ERROR: No available nodes detected!")

wb3 = connect_to_node()
contract_address = Web3.to_checksum_address(os.getenv("CONTRACT_ADDR"))

# Event Topic Hash for createToken(string,string,uint256,uint8,address)
event_signature_hash = os.getenv("SIGNATURE_HASH")
print(f"🔍 Checking Txs for contract: {contract_address}")
print(f"Target event: {event_signature_hash}")

START_BLOCK = wb3.eth.block_number

def initialize_db():
    """Create tables if not exist"""
    conn = sqlite3.connect(os.getenv("DB_PATH"), timeout=2)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS wallets (
            wallet_address TEXT PRIMARY KEY,
            score INTEGER DEFAULT 0
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tokens (
            wallet_address TEXT,
            token_address TEXT,
            tx_hash TEXT,
            PRIMARY KEY (wallet_address, token_address, tx_hash)
        )
    """)

    conn.commit()
    conn.close()

initialize_db()

def update_wallet_score(wallet_address, conn, cursor):
    wallet_address = wallet_address.lower()

    cursor.execute("SELECT score FROM wallets WHERE wallet_address = ?", (wallet_address,))
    result = cursor.fetchone()

    if result:
        new_score = result[0] + int(os.getenv("ADD_SCORE"))
        cursor.execute("UPDATE wallets SET score = ? WHERE wallet_address = ?", (new_score, wallet_address))
        print(f"🔄 Update score: {wallet_address} -> {new_score}")
    else:
        cursor.execute("INSERT INTO wallets (wallet_address, score) VALUES (?, ?)", (wallet_address, 100))
        print(f"🆕 New address added: {wallet_address} -> 100")


def update_token_address(wallet_address, token_address, tx_hash):
    wallet_address = wallet_address.lower()
    token_address = token_address.lower()
    tx_hash = tx_hash.lower()

    conn = sqlite3.connect(os.getenv("DB_PATH"), timeout=2)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 1 FROM tokens
        WHERE wallet_address = ? AND token_address = ? AND tx_hash = ?
    """, (wallet_address, token_address, tx_hash))

    if cursor.fetchone():
        print(f"⚠️ Token already recorded for {wallet_address} in tx {tx_hash}")
    else:
        cursor.execute("""
            INSERT INTO tokens (wallet_address, token_address, tx_hash)
            VALUES (?, ?, ?)
        """, (wallet_address, token_address, tx_hash))
        print(f"🆕 Token recorded: {token_address} for {wallet_address} in tx {tx_hash}")
        update_wallet_score(wallet_address, conn, cursor)

    conn.commit()
    conn.close()


def scan_blocks(start_block):
    global wb3
    print(f"🚀 Start scan block: {start_block}")

    while True:
        try:
            latest_block = wb3.eth.block_number
            print(f"🔍 Check blocks from {start_block} to {latest_block}...")

            if start_block > latest_block:
                time.sleep(5)
                continue

            for block_number in range(start_block, latest_block + 1):
                block = wb3.eth.get_block(block_number, full_transactions=True)

                for tx in block.transactions:
                    if tx.to and tx.to.lower() == contract_address.lower():
                        print(f"📡 Find TX at block {block_number}")
                        print(f"🆔 Tx Hash: {tx.hash.hex()}")
                        sender = tx["from"]
                        print(f"👤 Sender: {sender}")

                        tx_receipt = wb3.eth.get_transaction_receipt(tx.hash)

                        created_token = None
                        found_event = False

                        for log in tx_receipt.logs:
                            esh = "0x" + event_signature_hash
                            if len(log["topics"]) > 0 and (log["topics"][0].hex() == event_signature_hash or log["topics"][0].hex() == esh):
                                found_event = True
                                print(f"📌 Find event `createToken` in tx {tx.hash.hex()}")

                                # 1
                                if log["address"].lower() != contract_address.lower():
                                    created_token = log["address"]

                                # 2
                                elif len(log["topics"]) > 1:
                                    possible_address = "0x" + log["topics"][1].hex()[-40:]
                                    if Web3.is_address(possible_address):
                                        created_token = Web3.to_checksum_address(possible_address)

                                # 3
                                elif len(log["data"]) >= 64:
                                    possible_address = "0x" + log["data"].hex()[-40:]
                                    if Web3.is_address(possible_address):
                                        created_token = Web3.to_checksum_address(possible_address)

                        # 4
                        if created_token == "0x0000000000000000000000000000000000000000":
                            for log in reversed(tx_receipt.logs):
                                if log["address"].lower() != contract_address.lower():
                                    created_token = log["address"]
                                    break

                        if created_token:
                            print(f"✅ New Token address: {created_token}")
                        else:
                            print(f"❌ ERROR: No token address extracted!")

                        if found_event and created_token:
                            update_token_address(sender, created_token, tx.hash.hex())

            start_block = latest_block + 1
            time.sleep(5)

        except Exception as e:
            print(f"❌ ERROR: {e}")
            print("🔄 Trying another node...")
            time.sleep(10)
            wb3 = connect_to_node()

if __name__ == "__main__":
    scan_blocks(START_BLOCK)
