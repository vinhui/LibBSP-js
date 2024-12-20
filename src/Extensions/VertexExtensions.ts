import {Vertex} from '../Structs/Common/Vertex'
import {Vector2, Vector3, Vector4} from '../Util/Vector'
import {BSP, LumpInfo, MapType} from '../Structs/BSP/BSP'
import {Vector3Extensions} from './Vector3Extensions'
import {ColorExtensions} from './ColorExtensions'
import {Vector2Extensions} from './Vector2Extensions'
import {Vector4Extensions} from './Vector4Extensions'
import {Lump} from '../Structs/Common/Lumps/Lump'
import {Color} from '../Util/Color'
import {float, int} from '../Util/number'

export class VertexExtensions {
    public static Scale(vertex: Vertex, scalar: float): Vertex {
        vertex.position.x *= scalar
        vertex.position.y *= scalar
        vertex.position.z *= scalar
        return vertex
    }

    public static Add(a: Vertex, b: Vertex): Vertex {
        a.position.x += b.position.x
        a.position.y += b.position.y
        a.position.z += b.position.z
        return a
    }

    public static Translate(vertex: Vertex, vec: Vector3): Vertex {
        vertex.position.x += vec.x
        vertex.position.y += vec.y
        vertex.position.z += vec.z
        return vertex
    }

    public static CreateVertexFromParams(
        position: Vector3,
        normal: Vector3,
        color: Color,
        uv0: Vector2,
        uv1: Vector2,
        uv2: Vector2,
        uv3: Vector2,
        tangent: Vector4,
    ): Vertex {
        const v = new Vertex()
        v.position = position
        v.normal = normal
        v.color = color
        v.uv0 = uv0
        v.uv1 = uv1
        v.uv2 = uv2
        v.uv3 = uv3
        v.tangent = tangent
        return v
    }

    public static CreateVertexFromData(data: Uint8Array, type: MapType, _version: int = 0): Vertex {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        const position = Vector3Extensions.ToVector3(data, 0)
        let normal = new Vector3(0, 0, -1)
        let color = ColorExtensions.FromArgb(255, 255, 255, 255)
        let tangent = new Vector4(1, 0, 0, -1)
        let uv0 = new Vector2()
        let uv1 = new Vector2()
        let uv2 = new Vector2()
        let uv3 = new Vector2()

        if (type === MapType.CoD2 || type === MapType.CoD4) {
            normal = Vector3Extensions.ToVector3(data, 12)
            color = ColorExtensions.FromArgb((data[27] ?? 0), (data[24] ?? 0), (data[25] ?? 0), (data[26] ?? 0))
            uv0 = Vector2Extensions.ToVector2(data, 28)
            uv1 = Vector2Extensions.ToVector2(data, 36)
            tangent = Vector4Extensions.ToVector4(data, 44)
            uv2 = Vector2Extensions.ToVector2(data, 60)
        } else if (MapType.IsSubtypeOf(type, MapType.STEF2)) {
            uv0 = Vector2Extensions.ToVector2(data, 12)
            uv1 = Vector2Extensions.ToVector2(data, 20)
            const view = new DataView(data.buffer)
            uv2 = new Vector2(view.getFloat32(28, true), 0)
            color = ColorExtensions.FromArgb((data[35] ?? 0), (data[32] ?? 0), (data[33] ?? 0), (data[34] ?? 0))
            normal = Vector3Extensions.ToVector3(data, 36)
        } else if (type === MapType.Raven) {
            uv0 = Vector2Extensions.ToVector2(data, 12)
            uv1 = Vector2Extensions.ToVector2(data, 20)
            uv2 = Vector2Extensions.ToVector2(data, 28)
            uv3 = Vector2Extensions.ToVector2(data, 36)
            normal = Vector3Extensions.ToVector3(data, 52)
            color = ColorExtensions.FromArgb((data[67] ?? 0), (data[64] ?? 0), (data[65] ?? 0), (data[66] ?? 0))
            // Use for two more float fields and two more colors.
            // There's actually another field that seems to be color but I've only ever seen it be 0xFFFFFFFF.
            tangent = Vector4Extensions.ToVector4(data, 44)
        } else if (MapType.IsSubtypeOf(type, MapType.Quake3)) {
            uv0 = Vector2Extensions.ToVector2(data, 12)
            uv1 = Vector2Extensions.ToVector2(data, 20)
            normal = Vector3Extensions.ToVector3(data, 28)
            color = ColorExtensions.FromArgb((data[43] ?? 0), (data[40] ?? 0), (data[41] ?? 0), (data[42] ?? 0))
        }

        return this.CreateVertexFromParams(
            position,
            normal,
            color,
            uv0,
            uv1,
            uv2,
            uv3,
            tangent,
        )
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): Lump<Vertex> {
        if (!data) {
            throw new Error('ArgumentNullException')
        }
        const structLength = this.GetStructLength(bsp.mapType, lumpInfo.version)
        const numObjects = data.length / structLength
        const arr: Vertex[] = []
        for (let i = 0; i < numObjects; i++) {
            const bytes = data.slice(i * structLength, (i * structLength) + structLength)
            arr.push(
                this.CreateVertexFromData(bytes, bsp.mapType, lumpInfo.version),
            )
        }
        return new Lump(Vertex, arr, bsp, lumpInfo)
    }

    public static GetIndexForLump(type: MapType): int {
        if (MapType.IsSubtypeOf(type, MapType.Quake2)) {
            return 2
        } else if (MapType.IsSubtypeOf(type, MapType.Quake)
            || MapType.IsSubtypeOf(type, MapType.Source)
            || type === MapType.Titanfall
        ) {
            return 3
        } else if (MapType.IsSubtypeOf(type, MapType.MOHAA)
            || MapType.IsSubtypeOf(type, MapType.FAKK2)
            || type === MapType.Nightfire
        ) {
            return 4
        } else if (MapType.IsSubtypeOf(type, MapType.STEF2)) {
            return 6
        } else if (type === MapType.CoD || type === MapType.CoDDemo) {
            return 7
        } else if (type === MapType.CoD2) {
            return 8
        } else if (MapType.IsSubtypeOf(type, MapType.Quake3)) {
            return 10
        }
        return -1
    }

    public static GetStructLength(type: MapType, _version: int): int {
        if (MapType.IsSubtypeOf(type, MapType.Quake)
            || MapType.IsSubtypeOf(type, MapType.Quake2)
            || type === MapType.Nightfire
            || MapType.IsSubtypeOf(type, MapType.Source)
            || type === MapType.Titanfall
        ) {
            return 12
        } else if (type === MapType.CoD2 || type === MapType.CoD4) {
            return 68
        } else if (MapType.IsSubtypeOf(type, MapType.STEF2)) {
            return 48
        } else if (type === MapType.Raven) {
            return 80
        } else if (MapType.IsSubtypeOf(type, MapType.Quake3)) {
            return 44
        }
        return -1
    }

    public static GetBytes(vertex: Vertex, type: MapType, version: int, targetArray?: Uint8Array, offset?: int): Uint8Array {
        offset = offset ?? 0
        const bytes = targetArray ?? new Uint8Array(this.GetStructLength(type, version))
        const view = new DataView(bytes.buffer)

        if (type === MapType.CoD2 || type === MapType.CoD4) {
            vertex.normal.getBytes(bytes, 12 + offset)
            vertex.color.getBytes(bytes, 24 + offset)
            vertex.uv0.getBytes(bytes, 28 + offset)
            vertex.uv1.getBytes(bytes, 36 + offset)
            // Use these fields to store additional unknown information
            vertex.tangent.getBytes(bytes, 44 + offset)
            vertex.uv3.getBytes(bytes, 60 + offset)
        } else if (type === MapType.Raven) {
            vertex.uv0.getBytes(bytes, 12 + offset)
            vertex.uv1.getBytes(bytes, 20 + offset)
            vertex.uv2.getBytes(bytes, 28 + offset)
            vertex.uv3.getBytes(bytes, 36 + offset)
            view.setFloat32(44 + offset, vertex.tangent.x, true)
            view.setFloat32(48 + offset, vertex.tangent.y, true)
            vertex.normal.getBytes(bytes, 52 + offset)
            vertex.color.getBytes(bytes, 64 + offset)
            view.setFloat32(68 + offset, vertex.tangent.z, true)
            view.setFloat32(72 + offset, vertex.tangent.w, true)
            // There's actually another field that I've only ever seen it be FFFFFFFF.
            bytes[76 + offset] = 255
            bytes[77 + offset] = 255
            bytes[78 + offset] = 255
            bytes[79 + offset] = 255
        } else if (MapType.IsSubtypeOf(type, MapType.STEF2)) {
            vertex.uv0.getBytes(bytes, 12 + offset)
            vertex.uv1.getBytes(bytes, 20 + offset)
            view.setFloat32(28 + offset, vertex.uv2.x, true)
            vertex.color.getBytes(bytes, 32 + offset)
            vertex.normal.getBytes(bytes, 36 + offset)
        } else if (MapType.IsSubtypeOf(type, MapType.Quake3)) {

            vertex.uv0.getBytes(bytes, 12 + offset)
            vertex.uv1.getBytes(bytes, 20 + offset)
            vertex.normal.getBytes(bytes, 28 + offset)
            vertex.color.getBytes(bytes, 40 + offset)
        }

        vertex.position.getBytes(bytes, offset)

        return bytes
    }
}