import {Lump} from '../../Common/Lumps/Lump'
import {BSP, LumpInfo, MapType} from '../BSP'
import {StringExtensions} from '../../../Extensions/StringExtensions'
import {int, short} from '../../../Util/number'
import {StaticProp} from '../StaticProp'
import {LumpObjDataCtor} from '../../Common/ILumpObject'

export class StaticProps extends Lump<StaticProp> {
    public static readonly ModelNameLength = 128

    public modelDictionary: string[] = []
    public leafIndices: short[] = []

    public override get length(): int {
        return 12
            + this.modelDictionary.length * StaticProps.ModelNameLength
            + this.leafIndices.length * 2
            + this._backingArray.length * (this._backingArray[0]?.data.length ?? 0)
    }

    public static CreateFromProps(items: StaticProp[], dictionary: string[], bsp: BSP, lumpInfo: LumpInfo = new LumpInfo()): StaticProps {
        const c = new StaticProps(StaticProp, items, bsp, lumpInfo)
        c.modelDictionary = dictionary
        return c
    }

    public override fromData(data: Uint8Array, structLength: number): this {
        if (!data || !this.bsp) {
            throw new Error('ArgumentNullException')
        }

        const view = new DataView(data.buffer)

        if (data.length > 0) {
            let offset = 0

            const dictSize = view.getInt32(0, true)
            offset += 4
            for (let i = 0; i < dictSize; i++) {
                this.modelDictionary.push(StringExtensions.ToNullTerminatedString(data, offset, StaticProps.ModelNameLength))
                offset += StaticProps.ModelNameLength
            }

            const leafIndiciesCount = view.getInt32(offset, true)
            offset += 4
            for (let i = 0; i < leafIndiciesCount; i++) {
                this.leafIndices.push(view.getInt16(offset, true))
                offset += 2
            }
            if (this.bsp.mapType === MapType.Vindictus && this.lumpInfo.version >= 6) {
                const numPropsScales = view.getInt32(offset, true)
                offset += 4 + numPropsScales * 16
            }
            const numProps = view.getInt32(offset, true)
            if (this.lumpInfo.version === 12) {
                offset += 12
            } else {
                offset += 4
            }

            if (numProps > 0) {
                structLength = (data.length - offset) / numProps
                for (let i = 0; i < numProps; i++) {
                    const bytes = data.slice(offset, offset + structLength)
                    this._backingArray.push(new StaticProp(new LumpObjDataCtor(bytes, this)))
                    offset += structLength
                }
            }
        } else {
            this.modelDictionary = []
        }
        return this
    }

    public override getBytes(_lumpOffset = 0): Uint8Array {
        if (this._backingArray.length === 0) {
            return new Uint8Array(12)
        }

        const length = this.length
        const bytes = new Uint8Array(length)
        const view = new DataView(bytes.buffer)
        let offset = 0
        view.setInt32(offset, this.modelDictionary.length, true)
        offset += 4

        for (let i = 0; i < this.modelDictionary.length; i++) {
            let name = this.modelDictionary[i]
            if (name && name.length > StaticProps.ModelNameLength) {
                name = name.substring(0, StaticProps.ModelNameLength)
            }
            bytes.set(new TextEncoder().encode(name), offset)
            offset += StaticProps.ModelNameLength
        }

        view.setInt32(offset, this.leafIndices.length, true)
        offset += 4

        for (let i = 0; i < this.leafIndices.length; i++) {
            view.setInt16(offset, this.leafIndices[i] ?? 0, true)
            offset += 2
        }

        view.setInt32(offset, this._backingArray.length, true)
        offset += 4

        bytes.set(super.getBytes(), offset)

        return bytes
    }
}