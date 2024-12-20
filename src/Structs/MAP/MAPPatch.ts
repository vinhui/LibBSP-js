import {byte} from '../../Util/number'
import {Vector2, Vector3, Vector4} from '../../Util/Vector'
import {Vertex} from '../Common/Vertex'
import {VertexExtensions} from '../../Extensions/VertexExtensions'
import {ColorExtensions} from '../../Extensions/ColorExtensions'

function parseByte(n: string): byte {
    return parseInt(n, 10) % 255
}

export class MAPPatch {
    public points: Vector3[] = []
    public dims: Vector2
    public texture: string

    public constructor(lines: string[]) {
        this.texture = lines[2]!
        const vertices: Vertex[] = []

        switch (lines[0]) {
            case 'patchDef3':
            case 'patchDef2': {
                let line = lines[3]!.split(' ').filter(x => x)
                this.dims = new Vector2(parseFloat(line[1]!), parseFloat(line[2]!))
                for (let i = 0; i < this.dims.x; ++i) {
                    line = lines[i + 5]!.split(' ').filter(x => x)
                    for (let j = 0; j < this.dims.y; ++j) {
                        const point = new Vector3(parseFloat(line[2 + (j * 7)]!), parseFloat(line[3 + (j * 7)]!), parseFloat(line[4 + (j * 7)]!))
                        const uv = new Vector2(parseFloat(line[5 + (j * 7)]!), parseFloat(line[6 + (j * 7)]!))
                        const vertex = VertexExtensions.CreateVertexFromParams(point, new Vector3(0, 0, -1), ColorExtensions.FromArgb(255, 255, 255, 255), uv, new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0), new Vector4(1, 0, 0, -1))
                        vertices.push(vertex)
                    }
                }
                break
            }
            case 'patchTerrainDef3': {
                let line = lines[3]!.split(' ').filter(x => x)
                this.dims = new Vector2(parseFloat(line[1]!), parseFloat(line[2]!))
                for (let i = 0; i < this.dims.x; ++i) {
                    line = lines[i + 5]!.split(' ').filter(x => x)
                    for (let j = 0; j < this.dims.y; ++j) {
                        const point = new Vector3(parseFloat(line[2 + (j * 12)]!), parseFloat(line[3 + (j * 12)]!), parseFloat(line[4 + (j * 12)]!))
                        const uv = new Vector2(parseFloat(line[5 + (j * 12)]!), parseFloat(line[6 + (j * 12)]!))
                        const color = ColorExtensions.FromArgb(parseByte(line[7 + (j * 12)]!), parseByte(line[8 + (j * 12)]!), parseByte(line[9 + (j * 12)]!), parseByte(line[10 + (j * 12)]!))
                        const vertex = VertexExtensions.CreateVertexFromParams(point, new Vector3(0, 0, -1), color, uv, new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0), new Vector4(1, 0, 0, -1))
                        vertices.push(vertex)
                    }
                }
                break
            }
            default: {
                throw new Error(`Unknown patch type ${lines[0]}! Call a scientist! `)
            }
        }
    }
}