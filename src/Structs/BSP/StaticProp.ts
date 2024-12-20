import {Vector3} from '../../Util/Vector'
import {ILumpObject} from '../Common/ILumpObject'
import {BSP, LumpInfo, MapType} from './BSP'
import {Vector3Extensions} from '../../Extensions/Vector3Extensions'
import {StaticProps} from './Lumps/StaticProps'
import {byte, float, int, short} from '../../Util/number'
import {Color} from '../../Util/Color'
import {ColorExtensions} from '../../Extensions/ColorExtensions'
import {StringExtensions} from '../../Extensions/StringExtensions'
import {ILump} from '../Common/Lumps/ILump'

export class StaticProp extends ILumpObject<StaticProp> {
    public get origin(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12: {
                    return Vector3Extensions.ToVector3(this.data)
                }
            }
        }

        return new Vector3(0, 0, 0)
    }

    public set origin(value: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12: {
                    value.getBytes(this.data, 0)
                    break
                }
            }
        }
    }

    public get angles(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12: {
                    return Vector3Extensions.ToVector3(this.data, 12)
                }
            }
        }

        return new Vector3(0, 0, 0)
    }

    public set angles(value: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12: {
                    value.getBytes(this.data, 12)
                    break
                }
            }
        }
    }

    public get model(): string | undefined {
        return (this._parent as StaticProps).modelDictionary[this.modelIndex]
    }

    public get modelIndex(): short {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12: {
                    const view = new DataView(this.data.buffer)
                    return view.getInt16(24, true)
                }
            }
        }

        return -1
    }

    public set modelIndex(value: short) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12: {
                    const view = new DataView(this.data.buffer)
                    view.setInt16(24, value)
                    break
                }
            }
        }
    }

    public get leafIndices(): short[] {
        const arr: short[] = []
        for (let i = 0; i < this.numLeafIndices; ++i) {
            arr.push((this._parent as StaticProps).leafIndices[this.firstLeafIndexIndex + i] ?? 0)
        }
        return arr
    }

    public get firstLeafIndexIndex(): short {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11: {
                    const view = new DataView(this.data.buffer)
                    return view.getInt16(26, true)
                }
            }
        }

        return -1
    }

    public set firstLeafIndexIndex(value: short) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11: {
                    const view = new DataView(this.data.buffer)
                    view.setInt16(26, value)
                    break
                }
            }
        }
    }

    public get numLeafIndices(): short {
        if (this.mapType === MapType.Source) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11: {
                    const view = new DataView(this.data.buffer)
                    return view.getInt16(28, true)
                }
            }
        }

        return -1
    }

    public set numLeafIndices(value: short) {
        if (this.mapType === MapType.Source) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11: {
                    const view = new DataView(this.data.buffer)
                    view.setInt16(28, value)
                    break
                }
            }
        }
    }

    public get solidity(): byte {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12: {
                    return this.data[30] ?? 0
                }
            }
        }

        return 0
    }

    public set solidity(value: byte) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12: {
                    this.data[30] = value
                    break
                }
            }
        }
    }

    public get flags(): byte {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12: {
                    return this.data[31] ?? 0
                }
            }
        }

        return 0
    }

    public set flags(value: byte) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12: {
                    this.data[31] = value
                    break
                }
            }
        }
    }

    public get skin(): int {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 10:
                case 11:
                case 12: {
                    const view = new DataView(this.data.buffer)
                    return view.getInt32(32, true)
                }
                case 9: {
                    if (this.data.length === 76) {
                        const view = new DataView(this.data.buffer)
                        return view.getInt32(36, true)
                    } else {
                        const view = new DataView(this.data.buffer)
                        return view.getInt32(32, true)
                    }
                }
            }
        }
        return -1
    }

    public set skin(value: int) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 10:
                case 11:
                case 12: {
                    const view = new DataView(this.data.buffer)
                    view.setInt32(32, value)
                    break
                }
                case 9: {
                    if (this.data.length === 76) {
                        const view = new DataView(this.data.buffer)
                        view.setInt32(36, value)
                    } else {
                        const view = new DataView(this.data.buffer)
                        view.setInt32(32, value)
                    }
                    break
                }
            }
        }
    }

    public get minimumFadeDistance(): float {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 10:
                case 11:
                case 12: {
                    const view = new DataView(this.data.buffer)
                    return view.getFloat32(36, true)
                }
                case 9: {
                    if (this.data.length === 76) {
                        const view = new DataView(this.data.buffer)
                        return view.getFloat32(40, true)
                    } else {
                        const view = new DataView(this.data.buffer)
                        return view.getFloat32(36, true)
                    }
                }
            }
        }

        return Number.NaN
    }

    public set minimumFadeDistance(value: float) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 10:
                case 11:
                case 12: {
                    const view = new DataView(this.data.buffer)
                    view.setFloat32(36, value)
                    break
                }
                case 9: {
                    if (this.data.length === 76) {
                        const view = new DataView(this.data.buffer)
                        view.setFloat32(40, value)
                    } else {
                        const view = new DataView(this.data.buffer)
                        view.setFloat32(36, value)
                    }
                    break
                }
            }
        }
    }

    public get maximumFadeDistance(): float {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 10:
                case 11:
                case 12: {
                    const view = new DataView(this.data.buffer)
                    return view.getFloat32(40, true)
                }
                case 9: {
                    if (this.data.length === 76) {
                        const view = new DataView(this.data.buffer)
                        return view.getInt32(44, true)
                    } else {
                        const view = new DataView(this.data.buffer)
                        return view.getInt32(40, true)
                    }
                }
            }
        }

        return Number.NaN
    }

    public set maximumFadeDistance(value: float) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 10:
                case 11:
                case 12: {
                    const view = new DataView(this.data.buffer)
                    view.setInt32(40, value)
                    break
                }
                case 9: {
                    if (this.data.length === 76) {
                        const view = new DataView(this.data.buffer)
                        view.setInt32(44, value)
                    } else {
                        const view = new DataView(this.data.buffer)
                        view.setInt32(40, value)
                    }
                    break
                }
            }
        }
    }

    public get lightingOrigin(): Vector3 {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 10:
                case 11:
                case 12: {
                    return Vector3Extensions.ToVector3(this.data, 44)
                }
                case 9: {
                    if (this.data.length === 76) {
                        return Vector3Extensions.ToVector3(this.data, 48)
                    } else {
                        return Vector3Extensions.ToVector3(this.data, 44)
                    }
                }
            }
        }

        return new Vector3(0, 0, 0)
    }

    public set lightingOrigin(value: Vector3) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 10:
                case 11:
                case 12: {
                    value.getBytes(this.data, 44)
                    break
                }
                case 9: {
                    if (this.data.length === 76) {
                        value.getBytes(this.data, 48)
                    } else {
                        value.getBytes(this.data, 44)
                    }
                    break
                }
            }
        }
    }

    public get forcedFadeScale(): float {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 5:
                case 6:
                case 7:
                case 8:
                case 10:
                case 11:
                case 12: {
                    const view = new DataView(this.data.buffer)
                    return view.getFloat32(56, true)
                }
                case 9: {
                    if (this.data.length === 76) {
                        const view = new DataView(this.data.buffer)
                        return view.getFloat32(60, true)
                    } else {
                        const view = new DataView(this.data.buffer)
                        return view.getFloat32(56, true)
                    }
                }
            }
        }

        return Number.NaN
    }

    public set forcedFadeScale(value: float) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 5:
                case 6:
                case 7:
                case 8:
                case 10:
                case 11:
                case 12: {
                    const view = new DataView(this.data.buffer)
                    view.setFloat32(56, value)
                    break
                }
                case 9: {
                    if (this.data.length === 76) {
                        const view = new DataView(this.data.buffer)
                        view.setFloat32(60, value)
                    } else {
                        const view = new DataView(this.data.buffer)
                        view.setFloat32(56, value)
                    }
                    break
                }
            }
        }
    }

    public get minimumDirectXLevel(): short {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            switch (this.lumpVersion) {
                case 6:
                case 7: {
                    const view = new DataView(this.data.buffer)
                    return view.getInt16(60, true)
                }
            }
        }

        return -1
    }

    public set minimumDirectXLevel(value: short) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            switch (this.lumpVersion) {
                case 6:
                case 7: {
                    const view = new DataView(this.data.buffer)
                    view.setInt16(60, value)
                    break
                }
            }
        }
    }

    public get maximumDirectXLevel(): short {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            switch (this.lumpVersion) {
                case 6:
                case 7: {
                    const view = new DataView(this.data.buffer)
                    return view.getInt16(62, true)
                }
            }
        }

        return -1
    }

    public set maximumDirectXLevel(value: short) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            switch (this.lumpVersion) {
                case 6:
                case 7: {
                    const view = new DataView(this.data.buffer)
                    view.setInt16(62, value)
                    break
                }
            }
        }
    }

    public get minimumCPULevel(): byte {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 8:
                case 10:
                case 11:
                case 12: {
                    return this.data[60] ?? 0
                }
                case 9: {
                    if (this.data.length === 76) {
                        return this.data[64] ?? 0
                    } else {
                        return this.data[60] ?? 0
                    }
                }
            }
        }

        return 0
    }

    public set minimumCPULevel(value: byte) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 8:
                case 10:
                case 11:
                case 12: {
                    this.data[60] = value
                    break
                }
                case 9: {
                    if (this.data.length === 76) {
                        this.data[64] = value
                    } else {
                        this.data[60] = value
                    }
                    break
                }
            }
        }
    }

    public get maximumCPULevel(): byte {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 8:
                case 10:
                case 11:
                case 12: {
                    return this.data[61] ?? 0
                }
                case 9: {
                    if (this.data.length === 76) {
                        return this.data[65] ?? 0
                    } else {
                        return this.data[61] ?? 0
                    }
                }
            }
        }

        return 0
    }

    public set maximumCPULevel(value: byte) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 8:
                case 10:
                case 11:
                case 12: {
                    this.data[61] = value
                    break
                }
                case 9: {
                    if (this.data.length === 76) {
                        this.data[65] = value
                    } else {
                        this.data[61] = value
                    }
                    break
                }
            }
        }
    }

    public get minimumGPULevel(): byte {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 8:
                case 10:
                case 11:
                case 12: {
                    return this.data[62] ?? 0
                }
                case 9: {
                    if (this.data.length === 76) {
                        return this.data[66] ?? 0
                    } else {
                        return this.data[62] ?? 0
                    }
                }
            }
        }

        return 0
    }

    public set minimumGPULevel(value: byte) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 8:
                case 10:
                case 11:
                case 12: {
                    this.data[62] = value
                    break
                }
                case 9: {
                    if (this.data.length === 76) {
                        this.data[66] = value
                    } else {
                        this.data[62] = value
                    }
                    break
                }
            }
        }
    }

    public get maximumGPULevel(): byte {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 8:
                case 10:
                case 11:
                case 12: {
                    return this.data[63] ?? 0
                }
                case 9: {
                    if (this.data.length === 76) {
                        return this.data[67] ?? 0
                    } else {
                        return this.data[63] ?? 0
                    }
                }
            }
        }

        return 0
    }

    public set maximumGPULevel(value: byte) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 8:
                case 10:
                case 11:
                case 12: {
                    this.data[63] = value
                    break
                }
                case 9: {
                    if (this.data.length === 76) {
                        this.data[67] = value
                    } else {
                        this.data[63] = value
                    }
                    break
                }
            }
        }
    }

    public get diffuseModulaton(): Color {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 7:
                case 8:
                case 10:
                case 11:
                case 12: {
                    return ColorExtensions.FromArgb(this.data[67] ?? 0, this.data[64] ?? 0, this.data[65] ?? 0, this.data[66] ?? 0)
                }
                case 9: {
                    if (this.data.length === 76) {
                        return ColorExtensions.FromArgb(this.data[72] ?? 0, this.data[69] ?? 0, this.data[70] ?? 0, this.data[71] ?? 0)
                    } else {
                        return ColorExtensions.FromArgb(this.data[67] ?? 0, this.data[64] ?? 0, this.data[65] ?? 0, this.data[66] ?? 0)
                    }
                }
            }
        }

        return ColorExtensions.FromArgb(255, 255, 255, 255)
    }

    public set diffuseModulaton(value: Color) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)
            || this.mapType === MapType.Titanfall) {
            switch (this.lumpVersion) {
                case 7:
                case 8:
                case 10:
                case 11:
                case 12: {
                    value.getBytes(this.data, 64)
                    break
                }
                case 9: {
                    if (this.data.length === 76) {
                        value.getBytes(this.data, 69)
                    } else {
                        value.getBytes(this.data, 64)
                    }
                    break
                }
            }
        }
    }

    public get scale(): float {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            switch (this.lumpVersion) {
                case 11: {
                    const view = new DataView(this.data.buffer)
                    return view.getFloat32(76, true)
                }
            }
        }

        return Number.NaN
    }

    public set scale(value: float) {
        if (MapType.IsSubtypeOf(this.mapType, MapType.Source)) {
            switch (this.lumpVersion) {
                case 11: {
                    const view = new DataView(this.data.buffer)
                    view.setFloat32(76, value)
                    break
                }
            }
        }
    }

    public get name(): string | null {
        if (this.mapType === MapType.Source20) {
            switch (this.lumpVersion) {
                case 5:
                case 6: {
                    if (this.data.length > 128) {
                        return StringExtensions.ToNullTerminatedString(this.data, this.data.length - 128, 128)
                    }
                    return null
                }
            }
        }

        return null
    }

    public set name(value: string | undefined | null) {
        if (this.mapType === MapType.Source20) {
            switch (this.lumpVersion) {
                case 5:
                case 6: {
                    if (this.data.length > 128) {
                        // Zero out the bytes
                        for (let i = 0; i < 128; ++i) {
                            this.data[this.data.length - i - 1] = 0
                        }
                        if (value) {
                            for (let i = 0; i < 127; i++) {
                                this.data[this.data.length - 128 + i] = value.charCodeAt(i)
                            }
                        }
                    }
                    break
                }
            }
        }
    }

    public static LumpFactory(data: Uint8Array, bsp: BSP, lumpInfo: LumpInfo): StaticProps {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        const l = new StaticProps(StaticProp, undefined, bsp, lumpInfo)
        l.fromData(data, StaticProp.GetStructLength(bsp.mapType, lumpInfo.version))
        return l
    }


    public static GetStructLength(_mapType: MapType, _lumpVersion: int = 0): int {
        return -1
    }


    protected ctorCopy(source: StaticProp, parent: ILump): void {
        this._parent = parent

        if (parent?.bsp) {
            if (source.parent?.bsp && source.parent.bsp.mapType === parent.bsp.mapType && source.lumpVersion === parent.lumpInfo.version) {
                this.data = new Uint8Array(source.data)
                return
            } else {
                //Data = new byte[GetStructLength(parent.bsp.version, parent.LumpInfo.version)];
            }
        } else {
            //if (source.parent?.bsp)
            //{
            //    Data = new byte[GetStructLength(source.parent.bsp.version, source.Parent.LumpInfo.version)];
            //}
            //else
            //{
            //    Data = new byte[GetStructLength(MapType.Undefined, 0)];
            //}
        }

        this.data = new Uint8Array(192)

        this.origin = source.origin
        this.angles = source.angles
        this.modelIndex = source.modelIndex
        this.firstLeafIndexIndex = source.firstLeafIndexIndex
        this.numLeafIndices = source.numLeafIndices
        this.solidity = source.solidity
        this.flags = source.flags
        this.skin = source.skin
        this.minimumFadeDistance = source.minimumFadeDistance
        this.maximumFadeDistance = source.maximumFadeDistance
        this.lightingOrigin = source.lightingOrigin
        this.forcedFadeScale = source.forcedFadeScale
        this.minimumDirectXLevel = source.minimumDirectXLevel
        this.maximumDirectXLevel = source.maximumDirectXLevel
        this.minimumCPULevel = source.minimumCPULevel
        this.maximumCPULevel = source.maximumCPULevel
        this.minimumGPULevel = source.minimumGPULevel
        this.maximumGPULevel = source.maximumGPULevel
        this.diffuseModulaton = source.diffuseModulaton
        this.scale = source.scale
        this.name = source.name
    }

}