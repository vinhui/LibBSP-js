import {ILump} from '../../Common/Lumps/ILump'
import {BSP, LumpInfo, MapType} from '../BSP'
import {int} from '../../../Util/number'
import {StaticProps} from './StaticProps'
import {StaticProp} from '../StaticProp'

export enum GameLumpType {
    hlpd = 1685089384,
    tlpd = 1685089396,
    prpd = 1685090928,
    prps = 1936749168,
}

export class GameLump implements ILump {
    public bsp: BSP
    public lumpOffsetsRelativeToGameLumpOffset = false
    private _backingMap: Map<GameLumpType, LumpInfo> = new Map()

    public constructor(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo = new LumpInfo()) {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        this.bsp = bsp
        this._lumpInfo = lumpInfo

        let structLength = 0
        if (bsp.mapType === MapType.DMoMaM || bsp.mapType === MapType.Vindictus) {
            structLength = 20
        } else if (MapType.IsSubtypeOf(bsp.mapType, MapType.Source) || bsp.mapType === MapType.Titanfall) {
            structLength = 16
        } else {
            throw new Error(`Game lump does not exist in map type ${bsp.mapType} or has not been implemented.`)
        }

        if (data.length < 4) {
            data = new Uint8Array(4)
        }
        const view = new DataView(data.buffer)

        const numGameLumps = view.getInt32(0, true)
        this._lumps = new Map()

        if (numGameLumps > 0) {
            const lumpDictionaryOffset = bsp.mapType === MapType.DMoMaM ? 8 : 4
            let lowestLumpOffset = Number.POSITIVE_INFINITY

            for (let i = 0; i < numGameLumps; i++) {
                const lumpIdent = view.getInt32(i * structLength + lumpDictionaryOffset, true)
                let lumpFlags: int
                let lumpVersion: int
                let lumpOffset: int
                // @ts-expect-error Unused but keeping it for pairty with C# LibBSP
                let _lumpLength: int

                if (bsp.mapType === MapType.Vindictus) {

                    lumpFlags = view.getInt32(i * structLength + lumpDictionaryOffset + 4, true)
                    lumpVersion = view.getInt32(i * structLength + lumpDictionaryOffset + 8, true)
                    lumpOffset = view.getInt32(i * structLength + lumpDictionaryOffset + 12, true)
                    _lumpLength = view.getInt32(i * structLength + lumpDictionaryOffset + 16, true)
                } else {
                    lumpFlags = view.getUint16(i * structLength + lumpDictionaryOffset + 4, true)
                    lumpVersion = view.getUint16(i * structLength + lumpDictionaryOffset + 6, true)
                    lumpOffset = view.getInt32(i * structLength + lumpDictionaryOffset + 8, true)
                    _lumpLength = view.getInt32(i * structLength + lumpDictionaryOffset + 12, true)
                }

                const info = new LumpInfo()
                info.ident = lumpIdent
                info.flags = lumpFlags
                info.version = lumpVersion
                info.offset = lumpOffset
                info.length = lumpOffset
                info.lumpFile = lumpInfo.lumpFile

                this._backingMap.set(info.ident, info)
                if (info.offset < lowestLumpOffset) {
                    lowestLumpOffset = info.offset
                }
            }
            if (lowestLumpOffset < lumpInfo.offset + numGameLumps * structLength + lumpDictionaryOffset) {
                this.lumpOffsetsRelativeToGameLumpOffset = true
            }
        }
    }

    private _lumps: Map<GameLumpType, ILump>

    public get lumps(): Map<GameLumpType, ILump> {
        return this._lumps
    }

    private _lumpInfo: LumpInfo

    public get lumpInfo(): LumpInfo {
        return this._lumpInfo
    }

    public get length(): int {
        if (this._backingMap.size === 0) {
            return 4
        }

        const lumpInfoLength = this.bsp.mapType === MapType.DMoMaM || this.bsp.mapType === MapType.Vindictus ? 20 : 16
        const lumpDictionaryOffset = this.bsp.mapType === MapType.DMoMaM ? 8 : 4
        let length = lumpDictionaryOffset + lumpInfoLength * this._backingMap.size

        for (const type of this._backingMap.keys()) {
            if (this._lumps.has(type)) {
                length += this._lumps.get(type)?.length ?? 0
            } else {
                length += this._backingMap.get(type)?.length ?? 0
            }
        }

        return length
    }

    public get staticProps(): StaticProps | null {
        const type = GameLumpType.prps

        if (this._backingMap.has(type)) {
            if (!this._lumps.has(type)) {
                this._lumps.set(type, StaticProp.LumpFactory(this.readLump(this._backingMap.get(type))!, this.bsp, this._backingMap.get(type)!))
            }

            return this._lumps.get(type) as StaticProps
        }
        return null
    }

    public set staticProps(val: StaticProps) {
        this._lumps.set(GameLumpType.prps, val)
        val.bsp = this.bsp
    }

    public get staticPropsLoaded(): boolean {
        return this.lumpLoaded(GameLumpType.prps)
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): GameLump {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        return new GameLump(data, bsp, lumpInfo)
    }

    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Source)
            || type === MapType.Titanfall) {
            return 35
        }
        return -1
    }

    public getLowestLumpOffset(): int {
        let lowest = Number.MAX_VALUE
        for (const info of this._backingMap.values()) {
            if (info.offset < lowest) {
                lowest = info.offset
            }
        }
        return lowest
    }

    public readLump(info?: LumpInfo): Uint8Array | null {
        if (!info) return null
        const gameLumpType: GameLumpType = info.ident
        if (this._backingMap.has(gameLumpType)) {
            let thisLump: Uint8Array | null

            if (this.getLowestLumpOffset() < this._lumpInfo.offset) {
                const i = new LumpInfo()
                i.ident = info.ident
                i.flags = info.flags
                i.version = info.version
                i.offset = info.offset + this._lumpInfo.offset
                i.length = info.length
                thisLump = this.bsp.reader.readLump(i)
            } else {
                thisLump = this.bsp.reader.readLump(info)
            }

            return thisLump
        }
        return null
    }

    public lumpLoaded(type: GameLumpType): boolean {
        return this._lumps?.has(type) ?? false
    }

    public getLoadedLump(type: GameLumpType): ILump | undefined | null {
        if (!this.lumpLoaded(type)) {
            return null
        }
        return this._lumps.get(type)
    }

    public getBytes(lumpOffset: int): Uint8Array {
        if (this._backingMap.size === 0) {
            return new Uint8Array(4)
        }

        const lumpInfoLength = this.bsp.mapType === MapType.DMoMaM || this.bsp.mapType === MapType.Vindictus ? 20 : 16
        const lumpDictionaryOffset = this.bsp.mapType === MapType.DMoMaM ? 8 : 4
        let lumpLength = lumpDictionaryOffset + lumpInfoLength * this._backingMap.size

        const lumpBytes: Map<GameLumpType, Uint8Array> = new Map()
        for (const type of this._backingMap.keys()) {
            if (this._lumps.has(type)) {
                lumpBytes.set(type, this._lumps.get(type)!.getBytes(lumpLength))
            } else {
                lumpBytes.set(type, this.readLump(this._backingMap.get(type))!)
            }

            lumpLength += lumpBytes.get(type)?.byteLength ?? 0
        }

        const bytes = new Uint8Array(lumpLength)
        const view = new DataView(bytes.buffer)
        view.setInt32(0, lumpBytes.size, true)
        let lumpNumber = 0
        let internalOffset = lumpDictionaryOffset + lumpBytes.size * lumpInfoLength

        for (const [type, value] of lumpBytes.entries()) {
            const info = this._backingMap.get(type)
            if (!info) continue
            info.length = value.byteLength
            info.offset = internalOffset
            if (!this.lumpOffsetsRelativeToGameLumpOffset) {
                info.offset += lumpOffset
            }
            this._backingMap.set(type, info)

            view.setInt32(lumpNumber * lumpInfoLength + lumpDictionaryOffset, info.ident, true)

            if (this.bsp.mapType === MapType.Vindictus) {
                view.setInt32(lumpNumber * lumpInfoLength + lumpDictionaryOffset + 4, info.flags, true)
                view.setInt32(lumpNumber * lumpInfoLength + lumpDictionaryOffset + 8, info.version, true)
                view.setInt32(lumpNumber * lumpInfoLength + lumpDictionaryOffset + 12, info.offset, true)
                view.setInt32(lumpNumber * lumpInfoLength + lumpDictionaryOffset + 16, info.length, true)
            } else {
                view.setInt16(lumpNumber * lumpInfoLength + lumpDictionaryOffset + 4, info.flags, true)
                view.setInt16(lumpNumber * lumpInfoLength + lumpDictionaryOffset + 6, info.version, true)
                view.setInt32(lumpNumber * lumpInfoLength + lumpDictionaryOffset + 8, info.offset, true)
                view.setInt32(lumpNumber * lumpInfoLength + lumpDictionaryOffset + 12, info.length, true)
            }

            bytes.set(lumpBytes.get(type)!, internalOffset)

            internalOffset += lumpBytes.get(type)?.byteLength ?? 0
            ++lumpNumber
        }

        return bytes
    }
}