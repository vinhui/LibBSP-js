export type Int64 = bigint
export type UInt64 = bigint
export type Int32 = number
export type UInt32 = number
export type Int16 = number
export type UInt16 = number
export type Int8 = number
export type UInt8 = number
export type long = Int64
export type ulong = UInt64
export type int = Int32
export type uint = UInt32
export type short = Int16
export type ushort = UInt16
export type float = number
export type byte = UInt8
export type sbyte = Int8

export function trimFormatNumber(value: number, decimalPlaces: number, beforeDecimalPlaces: number = 4): string {
    let formatted = value.toFixed(decimalPlaces)
    formatted = formatted.replace(/(\.\d*?)0+$/, '$1')
    formatted = formatted.replace(/\.$/, '')

    const [whole, decimal] = formatted.split('.')
    if (whole && whole.length > beforeDecimalPlaces) {
        formatted = whole.slice(-beforeDecimalPlaces) + (decimal ? '.' + decimal : '')
    }

    return formatted
}