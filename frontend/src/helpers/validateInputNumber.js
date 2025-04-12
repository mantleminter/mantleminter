export function formatNumberWithCommas(number) {

    // if (number === undefined || number === null) {
    //     return '';
    // }
    
    // const int = number.toString().replace(/[^+\d]/g, '');
    // const str = int.toString().split('').reverse();
    // let answer = '';
    // for (let i = 0; i < str.length; i++) {
    //     if (i > 0 && i % 3 === 0) {
    //         answer = ',' + answer;
    //     }
    //     answer = str[i] + answer;
    // }
    return number;
}

export const formatNumberWithDots = (value) => {
    // if (value === undefined || value === null) return '';
    
    // const str = value.toString(); // гарантируем строку
    // const cleanValue = str.replace(/\./g, '');
    // return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return value;
};