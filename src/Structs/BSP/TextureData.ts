import {ILumpObject} from '../Common/ILumpObject'
import {ColorExtensions} from '../../Extensions/ColorExtensions'
import {Color} from '../../Util/Color'
import {Vector2, Vector3} from '../../Util/Vector'
import {ILump} from '../Common/Lumps/ILump'
import {BSP, LumpInfo, MapType} from './BSP'
import {Lump} from '../Common/Lumps/Lump'
import {int} from '../../Util/number'

export class TextureData extends ILumpObject<TextureData> {
    public get reflectivity(): Color {
        const view = new DataView(this.data.buffer)
        return ColorExtensions.FromArgb(
            view.getFloat32(0, true) * 255,
            view.getFloat32(4, true) * 255,
            view.getFloat32(8, true) * 255,
            255)
    }

    public set reflectivity(value: Color) {
        const r = value.r / 255
        const g = value.g / 255
        const b = value.b / 255
        new Vector3(r, g, b).getBytes(this.data, 0)
    }

    public get textureStringOffset(): bigint {
        return this._parent?.bsp.textureTable?.get(this.textureStringOffsetIndex) ?? BigInt(0)
    }

    public get textureStringOffsetIndex(): int {
        const view = new DataView(this.data.buffer)
        return view.getInt32(12, true)
    }

    public set textureStringOffsetIndex(value: int) {
        const view = new DataView(this.data.buffer)
        view.setInt32(12, value, true)
    }

    public get size(): Vector2 {
        const view = new DataView(this.data.buffer)
        return new Vector2(view.getInt32(16, true), view.getInt32(20, true))
    }

    public set size(value: Vector2) {
        const view = new DataView(this.data.buffer)
        const width = Math.trunc(value.x)
        const height = Math.trunc(value.y)
        view.setInt32(16, width, true)
        view.setInt32(20, height, true)
    }

    public get viewSize(): Vector2 {
        const view = new DataView(this.data.buffer)
        return new Vector2(
            view.getInt32(24, true),
            view.getInt32(28, true),
        )
    }

    public set viewSize(value: Vector2) {
        const view = new DataView(this.data.buffer)
        const width = Math.trunc(value.x)
        const height = Math.trunc(value.y)
        view.setInt32(24, width, true)
        view.setInt32(28, height, true)
    }

    public static GetStructLength(mapType: MapType, _lumpVersion: int = 0): int {
        if (mapType === MapType.Titanfall) {
            return 36
        } else if (MapType.IsSubtypeOf(mapType, MapType.Source)) {
            return 32
        }

        throw new Error(`Lump object TextureData does not exist in map type ${mapType} or has not been implemented.`)
    }

    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Source)) {
            return 2
        }
        return -1
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<TextureData> {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        const l = new Lump<TextureData>(TextureData, undefined, bsp, lumpInfo)
        l.fromData(data, TextureData.GetStructLength(bsp.mapType, lumpInfo.version))
        return l
    }

    protected ctorCopy(source: TextureData, parent: ILump): void {
        this._parent = parent

        if (parent?.bsp) {
            if (source.parent?.bsp && source.parent.bsp.mapType === parent.bsp.mapType && source.lumpVersion === parent.lumpInfo.version) {
                this.data = new Uint8Array(source.data)
                return
            } else {
                this.data = new Uint8Array(TextureData.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source.parent?.bsp) {
                this.data = new Uint8Array(TextureData.GetStructLength(source.parent?.bsp.mapType ?? MapType.Undefined, source.parent?.lumpInfo.version ?? 0))
            } else {
                this.data = new Uint8Array(TextureData.GetStructLength(MapType.Undefined, 0))
            }
        }

        this.reflectivity = source.reflectivity
        this.textureStringOffsetIndex = source.textureStringOffsetIndex
        this.size = source.size
        this.viewSize = source.viewSize
    }
}