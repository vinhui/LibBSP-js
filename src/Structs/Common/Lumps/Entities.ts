import {Lump} from './Lump'
import {Entity} from '../Entity'
import {int} from '../../../Util/number'
import {LumpObjDataCtor} from '../ILumpObject'

export class Entities extends Lump<Entity> {
    public override get length(): int {
        let length = 1

        for (const entity of this._backingArray) {
            length += entity.toString().length
        }

        return length
    }

    public removeAllWithAttribute(key: string, value: string): int {
        const newArr = this.getAllWithAttribute(key, value)
        const sizeDiff = this._backingArray.length - newArr.length
        this._backingArray = newArr
        return sizeDiff
    }

    public removeAllOfType(classname: string): int {
        const newArr = this.getAllOfType(classname)
        const sizeDiff = this._backingArray.length - newArr.length
        this._backingArray = newArr
        return sizeDiff
    }

    public getAllWithAttribute(key: string, value: string): Entity[] {
        return this._backingArray.filter(x => x.get(key)?.localeCompare(value, undefined, {sensitivity: 'base'}) === 0)
    }

    public getAllOfType(classname: string): Entity[] {
        return this._backingArray.filter(x => x.className.localeCompare(classname, undefined, {sensitivity: 'base'}) === 0)
    }

    public getAllWithName(targetname: string): Entity[] {
        return this._backingArray.filter(x => x.name.localeCompare(targetname, undefined, {sensitivity: 'base'}) === 0)
    }

    public getWithAttribute(key: string, value: string): Entity | undefined {
        return this._backingArray.find(x => x.get(key)?.localeCompare(value, undefined, {sensitivity: 'base'}) === 0)
    }

    public getOfType(classname: string): Entity | undefined {
        return this._backingArray.find(x => x.className.localeCompare(classname, undefined, {sensitivity: 'base'}) === 0)
    }

    public getWithName(targetname: string): Entity | undefined {
        return this._backingArray.find(x => x.name.localeCompare(targetname, undefined, {sensitivity: 'base'}) === 0)
    }

    public override getBytes(_lumpOffset: int = 0): Uint8Array {
        if (this._backingArray.length === 0) {
            return new Uint8Array(1)
        }

        let sb = ''
        for (const entity of this._backingArray) {
            sb += entity.toString()
        }
        sb += String.fromCharCode(0x00)


        return new TextEncoder().encode(sb)
    }

    public override fromData(data: Uint8Array, _structLength?: int): void {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        let inQuotes = false
        let braceCount = 0

        let currentChar = ''
        let current = ''
        const entities: Entity[] = []
        for (let offset = 0; offset < data.length; ++offset) {
            currentChar = String.fromCharCode(data[offset]!)

            if (currentChar === '"') {
                if (offset === 0) {
                    inQuotes = !inQuotes
                } else if (String.fromCharCode(data[offset - 1]!) !== '\\') {
                    // Allow for escape-sequenced quotes to not affect the state machine, but only if the quote isn't at the end of a line.
                    // Some Source engine entities use escape sequence quotes in values, but MoHAA has a map with an obvious erroneous backslash before a quote at the end of a line.
                    if (inQuotes && (offset + 1 >= data.length || String.fromCharCode(data[offset + 1]!) === '\n' || String.fromCharCode(data[offset + 1]!) === '\r')) {
                        inQuotes = false
                    }
                } else {
                    inQuotes = !inQuotes
                }
            }

            if (!inQuotes) {
                if (currentChar === '{') {
                    // Occasionally, texture paths have been known to contain { or }. Since these aren't always contained
                    // in quotes, we must be a little more precise about how we want to select our delimiters.
                    // As a general rule, though, making sure we're not in quotes is still very effective at error prevention.
                    if (offset === 0
                        || String.fromCharCode(data[offset - 1]!) === '\n'
                        || String.fromCharCode(data[offset - 1]!) === '\t'
                        || String.fromCharCode(data[offset - 1]!) === ' '
                        || String.fromCharCode(data[offset - 1]!) === '\r'
                    ) {
                        ++braceCount
                    }
                }
            }

            if (braceCount > 0) {
                current += currentChar
            }

            if (!inQuotes) {
                if (currentChar === '}') {
                    if (offset === 0 ||
                        String.fromCharCode(data[offset - 1]!) === '\n' ||
                        String.fromCharCode(data[offset - 1]!) === '\t' ||
                        String.fromCharCode(data[offset - 1]!) === ' ' ||
                        String.fromCharCode(data[offset - 1]!) === '\r'
                    ) {
                        braceCount--
                        if (braceCount === 0) {
                            const entity = new Entity(new LumpObjDataCtor(new Uint8Array(0), this))
                            entity.parseString(current)
                            entities.push(entity)
                            current = ''
                        }
                    }
                }
            }
        }

        if (braceCount !== 0) {
            throw new Error(`Brace mismatch when parsing entities! Entity: ${entities.length} Brace level: ${braceCount}`)
        }

        this._backingArray = entities
    }
}