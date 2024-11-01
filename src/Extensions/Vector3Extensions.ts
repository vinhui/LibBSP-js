import {Vector3} from '../Util/Vector'
import {BSP, LumpInfo, MapType} from '../Structs/BSP/BSP'
import {Lump} from '../Structs/Common/Lumps/Lump'
import {int} from '../Util/number'

export class Vector3Extensions {


    public static ToVector3(bytes: Uint8Array | DataView, startIndex: int = 0): Vector3 {
        let view: DataView
        if (bytes instanceof Uint8Array) {
            view = new DataView(bytes.buffer)
        } else {
            view = bytes
        }
        return new Vector3(
            view.getFloat32(startIndex, true),
            view.getFloat32(startIndex + 4, true),
            view.getFloat32(startIndex + 8, true),
        )
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<Vector3> {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        const structLength = this.GetStructLength(bsp.mapType, lumpInfo.version)
        const numObjects = data.length / structLength
        const arr: Vector3[] = []
        for (let i = 0; i < numObjects; i++) {
            arr.push(this.ToVector3(data, i * structLength))
        }
        const c = (): Vector3 => {
            return new Vector3()
        }
        // @ts-expect-error Normally there's no way to pass a factory function
        return new Lump(c, arr, bsp, lumpInfo)
    }

    public static GetIndexForNormalsLump(type: MapType): int {
        if (type === MapType.Nightfire) {
            return 5
        }
        return -1
    }

    public static GetIndexForPatchVertsLump(type: MapType): int {
        if (type === MapType.CoD || type === MapType.CoDDemo) {
            return 25
        }
        return -1
    }

    public static GetStructLength(_type: MapType, _version: int): int {
        return 12
    }
}