import {ILump} from '../Common/Lumps/ILump'
import {BSPReader} from '../../Util/BSPReader'
import {BSPHeader} from './BSPHeader'
import {Lump} from '../Common/Lumps/Lump'
import {Plane} from '../../Util/Plane'
import {Entity} from '../Common/Entity'
import {Entities} from '../Common/Lumps/Entities'
import {PlaneExtensions} from '../../Extensions/PlaneExtensions'
import {Vertex} from '../Common/Vertex'
import {VertexExtensions} from '../../Extensions/VertexExtensions'
import {Vector3} from '../../Util/Vector'
import {Vector3Extensions} from '../../Extensions/Vector3Extensions'
import {NumList} from '../Common/Lumps/NumList'
import {Visibility} from './Lumps/Visibility'
import {Texture} from './Texture'
import {GameLump} from './Lumps/GameLump'
import {StaticProps} from './Lumps/StaticProps'
import {TextureInfo} from '../Common/TextureInfo'
import {Textures} from './Lumps/Textures'
import {Lightmaps} from './Lumps/Lightmaps'
import {Leaf} from './Leaf'
import {Node} from './Node'
import {int} from '../../Util/number'
import {Face} from './Face'
import {Edge} from './Edge'
import {Brush} from './Brush'
import {BrushSide} from './BrushSide'
import {TextureData} from './TextureData'
import {Displacement} from './Displacement'
import {DisplacementVertex} from './DisplacementVertex'
import {Cubemap} from './Cubemap'
import {Overlay} from './Overlay'
import {StaticModel} from './StaticModel'
import {LODTerrain} from './LODTerrain'
import {Patch} from './Patch'
import {Model} from './Model'
import {File} from '../../FakeFileSystem'

export enum MapType {
    Undefined = 0x00000000,

    Quake = 0x01000000,
    GoldSrc = 0x01010000,
    BlueShift = 0x01010001,

    Quake2 = 0x02000000,
    Daikatana = 0x02000001,
    SoF = 0x02000002,
    SiN = 0x02000004,

    Quake3 = 0x04000000,
    ET = 0x04000001,
    Raven = 0x04010000,
    CoD = 0x04020000,
    CoDDemo = 0x04020001,
    CoD2 = 0x04020002,
    CoD4 = 0x04020004,
    UberTools = 0x04040000,
    STEF2 = 0x04040100,
    STEF2Demo = 0x04040101,
    MOHAA = 0x04040200,
    MOHAADemo = 0x04040201,
    MOHAABT = 0x04040202,
    FAKK2 = 0x04040400,
    Alice = 0x04040401,

    Nightfire = 0x08000000,

    Source = 0x10000000,
    Source17 = 0x10000100,
    Source18 = 0x10000200,
    Source19 = 0x10000400,
    Source20 = 0x10000800,
    DMoMaM = 0x10000801,
    Vindictus = 0x10000802,
    Source21 = 0x10001000,
    L4D2 = 0x10001001,
    TacticalInterventionEncrypted = 0x10001002,
    Source22 = 0x10002000,
    Source23 = 0x10004000,
    Source27 = 0x10008000,

    Titanfall = 0x20000000,
}

export namespace MapType {
    export function IsSubtypeOf(type: MapType, other: MapType): boolean {
        return (type & other) === other
    }
}

export class LumpInfo {
    public ident: int = 0
    public flags: int = 0
    public version: int = 0
    public offset: int = 0
    public length: int = 0
    public lumpFile: File = null!
}

export class BSP {
    public mapName?: string
    private _dict: Map<int, LumpInfo> = new Map()

    public constructor(nameOrFile?: string | File, mapType: MapType = MapType.Undefined) {
        if (typeof nameOrFile === 'string') {
            this.mapName = nameOrFile
            this.mapType = mapType
            const data = new Uint8Array(0)
            this._header = new BSPHeader(this, data)
        } else {
            this._reader = new BSPReader(nameOrFile)
            this.mapName = nameOrFile?.nameWithoutExtension
            this.mapType = mapType
            this._header = new BSPHeader(this, this.reader.getHeader(this.mapType))
        }

        this._lumps = new Map()
    }

    private _lumps: Map<int, ILump> | null

    public get lumps(): Map<int, ILump> | null {
        return this._lumps
    }

    private _mapType: MapType = MapType.Undefined

    public get mapType(): MapType {
        if (this._mapType === MapType.Undefined) {
            this._mapType = this.reader.getVersion()
        }
        return this._mapType
    }

    public set mapType(val: MapType) {
        if (val === MapType.Undefined) {
            this._lumps = null
        } else if (val !== this._mapType) {
            this._lumps = new Map()
        }
        this._mapType = val
    }

    private _reader: BSPReader | undefined

    public get reader(): BSPReader {
        if (!this._reader) {
            this._reader = new BSPReader()
        }
        return this._reader
    }

    public set reader(val: BSPReader) {
        this._reader = val
    }

    private _header: BSPHeader

    public get header(): BSPHeader {
        return this._header
    }

    private _bigEndian: boolean = false

    public get bigEndian(): boolean {
        return this._bigEndian
    }

    public get entitiesLoaded(): boolean {
        const index = Entity.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get planesLoaded(): boolean {
        const index = PlaneExtensions.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get texturesLoaded(): boolean {
        const index = Texture.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get verticesLoaded(): boolean {
        const index = VertexExtensions.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get normalsLoaded(): boolean {
        const index = Vector3Extensions.GetIndexForNormalsLump(this._mapType)
        return this.lumpLoaded(index)
    }

    public get nodesLoaded(): boolean {
        const index = Node.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get textureInfoLoaded(): boolean {
        const index = TextureInfo.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get facesLoaded(): boolean {
        const index = Face.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get leavesLoaded(): boolean {
        const index = Leaf.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get edgesLoaded(): boolean {
        const index = Edge.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get brushesLoaded(): boolean {
        const index = Brush.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get brushSidesLoaded(): boolean {
        const index = BrushSide.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get materialsLoaded(): boolean {
        const index = Texture.GetIndexForMaterialLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get visibilityLoaded(): boolean {
        const index = Visibility.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get lightmapsLoaded(): boolean {
        const index = Lightmaps.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get originalFacesLoaded(): boolean {
        const index = Face.GetIndexForOriginalFacesLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get textureDataLoaded(): boolean {
        const index = TextureData.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get displacementsLoaded(): boolean {
        const index = Displacement.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get displacementVerticesLoaded(): boolean {
        const index = DisplacementVertex.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get cubemapsLoaded(): boolean {
        const index = Cubemap.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get overlaysLoaded(): boolean {
        const index = Overlay.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get leafFacesLoaded(): boolean {
        const {index} = NumList.GetIndexForLeafFacesLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get faceEdgesLoaded(): boolean {
        const {index} = NumList.GetIndexForFaceEdgesLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get leafBrushesLoaded(): boolean {
        const {index} = NumList.GetIndexForLeafFacesLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get staticModelsLoaded(): boolean {
        const index = StaticModel.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get lodTerrainsLoaded(): boolean {
        const index = LODTerrain.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get leafStaticModelsLoaded(): boolean {
        const {index} = NumList.GetIndexForLeafStaticModelsLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get patchesLoaded(): boolean {
        const index = Patch.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get patchVertsLoaded(): boolean {
        const index = Vector3Extensions.GetIndexForPatchVertsLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get patchIndicesLoaded(): boolean {
        const {index} = NumList.GetIndexForPatchIndicesLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get leafPatchesLoaded(): boolean {
        const {index} = NumList.GetIndexForLeafPatchesLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get indicesLoaded(): boolean {
        const {index} = NumList.GetIndexForIndicesLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get textureTableLoaded(): boolean {
        const {index} = NumList.GetIndexForTexTableLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get displacementTrianglesLoaded(): boolean {
        const {index} = NumList.GetIndexForDisplacementTrianglesLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get gameLumpLoaded(): boolean {
        const index = GameLump.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get staticProps(): StaticProps | null {
        if (this.gameLump) {
            return this.gameLump.staticProps
        }
        return null
    }

    public set staticProps(val: StaticProps) {
        const lump = this.gameLump
        if (lump) {
            lump.staticProps = val
        }
    }

    public get staticPropsLoaded(): boolean {
        return this.gameLumpLoaded && this.gameLump!.staticPropsLoaded
    }

    public get leafBrushes(): NumList | null {
        if (!this._lumps) return null
        const {index, type} = NumList.GetIndexForLeafFacesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info)!, type, this, info))
            }
            return this._lumps.get(index) as NumList
        }
        return null
    }

    public set leafBrushes(val: NumList) {
        const {index} = NumList.GetIndexForLeafFacesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get planes(): Lump<Plane> | null {
        if (!this._lumps) return null
        const index = PlaneExtensions.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, PlaneExtensions.LumpFactory(this.reader.readLump(info)!, this, info))
            }

            return this._lumps.get(index) as Lump<Plane>
        }
        return null
    }

    public set planes(val: Lump<Plane>) {
        const index = PlaneExtensions.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get leafFaces(): NumList | null {
        if (!this._lumps) return null
        const {index, type} = NumList.GetIndexForLeafFacesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info)!, type, this, info))
            }
            return this._lumps.get(index) as NumList
        }
        return null
    }

    public set leafFaces(val: NumList) {
        const {index} = NumList.GetIndexForLeafFacesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get faceEdges(): NumList | null {
        if (!this._lumps) return null
        const {index, type} = NumList.GetIndexForFaceEdgesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info)!, type, this, info))
            }

            return this._lumps.get(index) as NumList
        }
        return null
    }

    public set faceEdges(val: NumList) {
        const {index} = NumList.GetIndexForFaceEdgesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get entities(): Entities | null {
        if (!this._lumps) return null
        const index = Entity.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Entity.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Entities
        }
        return null
    }

    public set entities(val: Entities) {
        const index = Entity.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get textures(): Textures | null {
        if (!this._lumps) return null
        const index = Texture.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Texture.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Textures
        }
        return null
    }

    public set textures(val: Textures) {
        const index = Texture.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get vertices(): Lump<Vertex> | null {
        if (!this._lumps) return null
        const index = VertexExtensions.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, VertexExtensions.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<Vertex>
        }
        return null
    }

    public set vertices(val: Lump<Vertex>) {
        const index = VertexExtensions.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get normals(): Lump<Vector3> | null {
        if (!this._lumps) return null
        const index = Vector3Extensions.GetIndexForNormalsLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Vector3Extensions.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<Vector3>
        }
        return null
    }

    public set normals(val: Lump<Vector3>) {
        const index = Vector3Extensions.GetIndexForNormalsLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get nodes(): Lump<Node> | null {
        if (!this._lumps) return null
        const index = Node.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Node.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<Node>
        }
        return null
    }

    public set nodes(val: Lump<Node>) {
        const index = Node.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get textureInfo(): Lump<TextureInfo> | null {
        if (!this._lumps) return null
        const index = TextureInfo.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, TextureInfo.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<TextureInfo>
        }
        return null
    }

    public set textureInfo(val: Lump<TextureInfo>) {
        const index = TextureInfo.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get faces(): Lump<Face> | null {
        if (!this._lumps) return null
        const index = Face.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Face.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<Face>
        }
        return null
    }

    public set faces(val: Lump<Face>) {
        const index = Face.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get leaves(): Lump<Leaf> | null {
        if (!this._lumps) return null
        const index = Leaf.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Leaf.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<Leaf>
        }
        return null
    }

    public set leaves(val: Lump<Leaf>) {
        const index = Leaf.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get edges(): Lump<Edge> | null {
        if (!this._lumps) return null
        const index = Edge.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Edge.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<Edge>
        }
        return null
    }

    public set edges(val: Lump<Edge>) {
        const index = Edge.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get models(): Lump<Model> | null {
        if (!this._lumps) return null
        const index = Model.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Model.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<Model>
        }
        return null
    }

    public set models(val: Lump<Model>) {
        const index = Model.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get brushes(): Lump<Brush> | null {
        if (!this._lumps) return null
        const index = Brush.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Brush.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<Brush>
        }
        return null
    }

    public set brushes(val: Lump<Brush>) {
        const index = Brush.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get brushSides(): Lump<BrushSide> | null {
        if (!this._lumps) return null
        const index = BrushSide.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, BrushSide.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<BrushSide>
        }
        return null
    }

    public set brushSides(val: Lump<BrushSide>) {
        const index = BrushSide.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get materials(): Textures | null {
        if (!this._lumps) return null
        const index = Texture.GetIndexForMaterialLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Texture.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Textures
        }
        return null
    }

    public set materials(val: Textures) {
        const index = Texture.GetIndexForMaterialLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get lightmaps(): Lightmaps | null {
        if (!this._lumps) return null
        const index = Lightmaps.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, new Lightmaps(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lightmaps
        }
        return null
    }

    public set lightmaps(val: Lightmaps) {
        const index = Lightmaps.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get originalFaces(): Lump<Face> | null {
        if (!this._lumps) return null
        const index = Face.GetIndexForOriginalFacesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Face.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<Face>
        }
        return null
    }

    public set originalFaces(val: Lump<Face>) {
        const index = Face.GetIndexForOriginalFacesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get textureData(): Lump<TextureData> | null {
        if (!this._lumps) return null
        const index = TextureData.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, TextureData.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<TextureData>
        }
        return null
    }

    public set textureData(val: Lump<TextureData>) {
        const index = TextureData.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get displacements(): Lump<Displacement> | null {
        if (!this._lumps) return null
        const index = Displacement.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Displacement.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<Displacement>
        }
        return null
    }

    public set displacements(val: Lump<Displacement>) {
        const index = Displacement.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get displacementVertices(): Lump<DisplacementVertex> | null {
        if (!this._lumps) return null
        const index = DisplacementVertex.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, DisplacementVertex.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<DisplacementVertex>
        }
        return null
    }

    public set displacementVertices(val: Lump<DisplacementVertex>) {
        const index = DisplacementVertex.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get cubemaps(): Lump<Cubemap> | null {
        if (!this._lumps) return null
        const index = Cubemap.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Cubemap.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<Cubemap>
        }
        return null
    }

    public set cubemaps(val: Lump<Cubemap>) {
        const index = Cubemap.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get overlays(): Lump<Overlay> | null {
        if (!this._lumps) return null
        const index = Overlay.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Overlay.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<Overlay>
        }
        return null
    }

    public set overlays(val: Lump<Overlay>) {
        const index = Overlay.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get staticModels(): Lump<StaticModel> | null {
        if (!this._lumps) return null
        const index = StaticModel.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, StaticModel.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<StaticModel>
        }
        return null
    }

    public set staticModels(val: Lump<StaticModel>) {
        const index = StaticModel.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get lodTerrains(): Lump<LODTerrain> | null {
        if (!this._lumps) return null
        const index = LODTerrain.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, LODTerrain.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<LODTerrain>
        }
        return null
    }

    public set lodTerrains(val: Lump<LODTerrain>) {
        const index = LODTerrain.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get leafStaticModels(): NumList | null {
        if (!this._lumps) return null
        const {index, type} = NumList.GetIndexForLeafStaticModelsLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info)!, type, this, info))
            }
            return this._lumps.get(index) as NumList
        }
        return null
    }

    public set leafStaticModels(val: NumList) {
        const {index} = NumList.GetIndexForLeafStaticModelsLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get patches(): Lump<Patch> | null {
        if (!this._lumps) return null
        const index = Patch.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Patch.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<Patch>
        }
        return null
    }

    public set patches(val: Lump<Patch>) {
        const index = Patch.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get patchVertices(): Lump<Vector3> | null {
        if (!this._lumps) return null
        const index = Vector3Extensions.GetIndexForPatchVertsLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Vector3Extensions.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Lump<Vector3>
        }
        return null
    }

    public set patchVertices(val: Lump<Vector3>) {
        const index = Vector3Extensions.GetIndexForPatchVertsLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get patchIndices(): NumList | null {
        if (!this._lumps) return null
        const {index, type} = NumList.GetIndexForPatchIndicesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info)!, type, this, info))
            }
            return this._lumps.get(index) as NumList
        }
        return null
    }

    public set patchIndices(val: NumList) {
        const {index} = NumList.GetIndexForPatchIndicesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get leafPatches(): NumList | null {
        if (!this._lumps) return null
        const {index, type} = NumList.GetIndexForLeafPatchesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info)!, type, this, info))
            }
            return this._lumps.get(index) as NumList
        }
        return null
    }

    public set leafPatches(val: NumList) {
        const {index} = NumList.GetIndexForLeafPatchesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get indices(): NumList | null {
        if (!this._lumps) return null
        const {index, type} = NumList.GetIndexForIndicesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info)!, type, this, info))
            }
            return this._lumps.get(index) as NumList
        }
        return null
    }

    public set indices(val: NumList) {
        const {index} = NumList.GetIndexForIndicesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get textureTable(): NumList | null {
        if (!this._lumps) return null
        const {index, type} = NumList.GetIndexForTexTableLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info)!, type, this, info))
            }
            return this._lumps.get(index) as NumList
        }
        return null
    }

    public set textureTable(val: NumList) {
        const {index} = NumList.GetIndexForTexTableLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get displacementTriangles(): NumList | null {
        if (!this._lumps) return null
        const {index, type} = NumList.GetIndexForDisplacementTrianglesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info)!, type, this, info))
            }
            return this._lumps.get(index) as NumList
        }
        return null
    }

    public set displacementTriangles(val: NumList) {
        const {index} = NumList.GetIndexForDisplacementTrianglesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get visibility(): Visibility | null {
        if (!this._lumps) return null
        const index = Visibility.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, new Visibility(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as Visibility
        }
        return null
    }

    public set visibility(val: Lump<Visibility>) {
        const index = Visibility.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get gameLump(): GameLump | null {
        if (!this._lumps) return null
        const index = GameLump.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, GameLump.LumpFactory(this.reader.readLump(info)!, this, info))
            }
            return this._lumps.get(index) as GameLump
        }
        return null
    }

    public set gameLump(val: GameLump) {
        const index = GameLump.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps) this._lumps = new Map()
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public static GetNumLumps(version: MapType): int {
        if (version === MapType.Titanfall) {
            return 128
        } else if (MapType.IsSubtypeOf(version, MapType.Source)) {
            return 64
        } else if (MapType.IsSubtypeOf(version, MapType.Quake)) {
            return 15
        } else if (MapType.IsSubtypeOf(version, MapType.MOHAA)) {
            return 28
        } else if (MapType.IsSubtypeOf(version, MapType.STEF2)) {
            return 30
        } else if (MapType.IsSubtypeOf(version, MapType.FAKK2) || version === MapType.SiN) {
            return 20
        } else if (version === MapType.Raven || version === MapType.Nightfire) {
            return 18
        } else if (version === MapType.Quake2) {
            return 19
        } else if (version === MapType.Daikatana) {
            return 21
        } else if (version === MapType.SoF) {
            return 22
        } else if (version === MapType.CoD || version === MapType.CoDDemo) {
            return 31
        } else if (version === MapType.CoD2) {
            return 39
        } else if (version === MapType.CoD4) {
            return 55
        } else if (version === MapType.Quake3 || version === MapType.ET) {
            return 17
        }
        return 0
    }

    public get(index: int): LumpInfo {
        if (!this._dict.has(index)) {
            this._dict.set(index, this.header.getLumpInfo(index))
        }
        return this._dict.get(index)!
    }

    public set(index: int, val: LumpInfo): void {
        this._dict.set(index, val)
    }

    public getReferencedObjects<T>(o: object, lumpName: keyof BSP): T[] {
        if (!o) {
            throw new Error('ArgumentNullException')
        }

        if (!lumpName) {
            throw new Error('ArgumentNullException')
        }

        if (!(lumpName in this)) {
            throw new Error(`The lump ${lumpName} does not exist in the BSP class.`)
        }
        const targetLump = this[lumpName] as unknown as Lump<T>

        if ('refObjectMap' in o) {
            const refMap = o.refObjectMap as { [key: string]: { count: () => number, index: () => number } }
            if (lumpName in refMap) {
                const count = refMap[lumpName]!.count()
                const index = refMap[lumpName]!.index()

                const result: T[] = []
                for (let i = 0; i < count; i++) {
                    result.push(targetLump.get(index + i))
                }
                return result
            }
        }
        throw new Error(`An object of type ${targetLump.constructor.name} does not implement both an Index and Count for lump ${lumpName}.`)
    }

    public lumpLoaded(index: int): boolean {
        return !!this._lumps && this._lumps.has(index)
    }

    public getLoadedLump(index: int): ILump | null {
        if (!this.lumpLoaded(index)) {
            return null
        }
        return this._lumps!.get(index)!
    }

    public updateHeader(newHeader: BSPHeader): void {
        this._header = newHeader

        for (const key of this._dict.keys()) {
            this.set(key, newHeader.getLumpInfo(key))
        }
    }
}