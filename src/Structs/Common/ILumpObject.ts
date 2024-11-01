import {ILump} from './Lumps/ILump'
import {MapType} from '../BSP/BSP'
import {int} from '../../Util/number'

export abstract class ILumpObject<T> {
    public constructor(obj: LumpObjDataCtor | LumpObjCopyCtor<T>) {
        if (obj instanceof LumpObjDataCtor) {
            this.ctorData(obj.data, obj.parent)
        } else if (obj instanceof LumpObjCopyCtor) {
            this.ctorCopy(obj.source, obj.parent)
        }
    }

    protected _parent?: ILump

    public get parent(): ILump | undefined {
        return this._parent
    }

    protected _data: Uint8Array = null!

    public get data(): Uint8Array {
        return this._data
    }

    public set data(value: Uint8Array) {
        this._data = value
    }

    public get mapType(): MapType {
        if (!this._parent?.bsp) {
            return MapType.Undefined
        }
        return this._parent.bsp.mapType
    }

    public get lumpVersion(): int {
        if (!this._parent) {
            return 0
        }
        return this._parent.lumpInfo.version
    }

    protected abstract ctorCopy(source: T, parent: ILump): void

    protected ctorData(data: Uint8Array, parent?: ILump): void {
        if (!data) {
            throw new Error('ArgumentNullException')
        }

        this.data = data
        this._parent = parent
    }
}

export class LumpObjDataCtor {
    public data: Uint8Array
    public parent?: ILump

    public constructor(data: Uint8Array, parent?: ILump) {
        this.data = data
        this.parent = parent
    }
}

export class LumpObjCopyCtor<T> {
    public source: T
    public parent: ILump

    public constructor(source: T, parent: ILump) {
        this.source = source
        this.parent = parent
    }
}
