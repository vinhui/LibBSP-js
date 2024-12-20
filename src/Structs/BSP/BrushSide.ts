import {ILumpObject} from '../Common/ILumpObject'
import {BSP, LumpInfo, MapType} from './BSP'
import {Plane} from '../../Util/Plane'
import {Texture} from './Texture'
import {ILump} from '../Common/Lumps/ILump'
import {Lump} from '../Common/Lumps/Lump'
import {float, int} from '../../Util/number'
import {Face} from './Face'
import {Displacement} from './Displacement'

export class BrushSide extends ILumpObject<BrushSide> {
    public get plane(): Plane | undefined {
        return this._parent?.bsp.planes?.get(this.planeIndex)
    }

    public get planeIndex(): int {
        if (this.mapType === MapType.STEF2
            || this.mapType === MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(4, true)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType === MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(0, true)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getUint16(0, true)
        }

        return -1
    }

    public set planeIndex(value: int) {
        if (this.mapType === MapType.STEF2
            || this.mapType === MapType.Nightfire) {
            const view = new DataView(this.data.buffer)
            view.setInt32(4, value, true)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType === MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(0, value, true)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(0, value, true)
        }
    }

    public get distance(): float {
        if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            return view.getFloat32(0, true)
        }

        return 0
    }

    public set distance(value: float) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.CoD)) {
            const view = new DataView(this.data.buffer)
            view.setFloat32(0, value, true)
        }
    }

    public get Texture(): Texture | undefined {
        return this._parent?.bsp.textures?.get(this.textureIndex)
    }

    public get textureIndex(): int {
        if (this.mapType === MapType.STEF2) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(0, true)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType === MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(4, true)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(2, true)
        }

        return -1
    }

    public set textureIndex(value: int) {
        if (this.mapType === MapType.STEF2) {
            const view = new DataView(this.data.buffer)
            view.setInt32(0, value, true)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake3)
            || this.mapType === MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(4, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Quake2)
            || MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(2, value)
        }
    }

    public get face(): Face | undefined {
        return this._parent?.bsp.faces?.get(this.faceIndex)
    }

    public get faceIndex(): int {
        switch (this.mapType) {
            case MapType.Nightfire: {
                const view = new DataView(this.data.buffer)
                return view.getInt32(0, true)
            }
            case MapType.Raven: {
                const view = new DataView(this.data.buffer)
                return view.getInt32(8, true)
            }
            default: {
                return -1
            }
        }
    }

    public set faceIndex(value: int) {
        switch (this.mapType) {
            case MapType.Nightfire: {
                const view = new DataView(this.data.buffer)
                view.setInt32(0, value)
                break
            }
            case MapType.Raven: {
                const view = new DataView(this.data.buffer)
                view.setInt32(8, value)
                break
            }
        }
    }

    public get displacement(): Displacement | undefined {
        return this._parent?.bsp.displacements?.get(this.displacementIndex)
    }

    public get displacementIndex(): int {
        if (this.mapType === MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            return view.getInt32(8, true)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            return view.getInt16(4, true)
        }

        return -1
    }

    public set displacementIndex(value: int) {
        if (this.mapType === MapType.Vindictus) {
            const view = new DataView(this.data.buffer)
            view.setInt32(8, value)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            const view = new DataView(this.data.buffer)
            view.setInt16(4, value)
        }
    }

    public get isBevel(): boolean {
        if (this.mapType === MapType.Vindictus) {
            return (this.data[12] ?? 0) > 0
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            return (this.data[6] ?? 0) > 0
        }

        return false
    }

    public set isBevel(value: boolean) {
        if (this.mapType === MapType.Vindictus) {
            this.data[12] = (value ? 1 : 0)
        } else if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            this.data[6] = (value ? 1 : 0)
        }
    }

    public get isThin(): boolean {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source) && this.mapType !== MapType.Vindictus) {
            return (this.data[7] ?? 0) > 0
        }

        return false
    }

    public set isThin(value: boolean) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source) && this.mapType !== MapType.Vindictus) {
            this.data[7] = (value ? 1 : 0)
        }
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<BrushSide> {
        if (!data) {
            throw new Error('ArgumentNullException')
        }
        const l = new Lump<BrushSide>(BrushSide, undefined, bsp, lumpInfo)
        l.fromData(data, BrushSide.GetStructLength(bsp.mapType, lumpInfo.version))
        return l
    }

    public static GetStructLength(type: MapType, _version: int): int {
        if (type === MapType.Vindictus) {
            return 16
        } else if (MapType.IsSubtypeOf(type, MapType.MOHAA)
            || type === MapType.Raven) {
            return 12
        } else if (MapType.IsSubtypeOf(type, MapType.Quake3)
            || MapType.IsSubtypeOf(type, MapType.Source)
            || type === MapType.SiN
            || type === MapType.Nightfire) {
            return 8
        } else if (MapType.IsSubtypeOf(type, MapType.Quake2)) {
            return 4
        }

        throw new Error(`Lump object BrushSide does not exist in map type ${type} or has not been implemented.`)
    }

    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Source)) {
            return 19
        } else if (MapType.IsSubtypeOf(type, MapType.Quake2)) {
            return 15
        } else if (MapType.IsSubtypeOf(type, MapType.STEF2)) {
            return 12
        } else if (MapType.IsSubtypeOf(type, MapType.MOHAA)) {
            return 11
        } else if (type === MapType.Nightfire) {
            return 16
        } else if (type === MapType.CoD || type === MapType.CoDDemo) {
            return 3
        } else if (type === MapType.CoD2
            || type === MapType.CoD4) {
            return 5
        } else if (MapType.IsSubtypeOf(type, MapType.FAKK2)) {
            return 10
        } else if (MapType.IsSubtypeOf(type, MapType.Quake3)) {
            return 9
        }

        return -1
    }

    protected ctorCopy(source: BrushSide, parent: ILump): void {
        this._parent = parent

        if (parent?.bsp) {
            if (source.parent?.bsp && source.parent.bsp.mapType === parent.bsp.mapType && source.lumpVersion === parent.lumpInfo.version) {
                this.data = new Uint8Array(source.data)
                return
            } else {
                this.data = new Uint8Array(BrushSide.GetStructLength(parent.bsp.mapType, parent.lumpInfo.version))
            }
        } else {
            if (source._parent?.bsp) {
                this.data = new Uint8Array(BrushSide.GetStructLength(source.parent?.bsp.mapType ?? MapType.Undefined, source.parent?.lumpInfo.version ?? 0))
            } else {
                this.data = new Uint8Array(BrushSide.GetStructLength(MapType.Undefined, 0))
            }
        }

        this.planeIndex = source.planeIndex
        this.textureIndex = source.textureIndex
        this.faceIndex = source.faceIndex
        this.displacementIndex = source.displacementIndex
        this.isBevel = source.isBevel
        this.isThin = source.isThin
    }
}