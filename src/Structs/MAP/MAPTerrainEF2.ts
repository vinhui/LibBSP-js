import {Vector3, Vector4} from '../../Util/Vector'
import {float, int} from '../../Util/number'
import {generate2dArray} from '../../Util/array'

export class MAPTerrainEF2 {
    public side: int = 0
    public texture: string = ''
    public textureShiftS: float = 0
    public textureShiftT: float = 0
    public texRot: float = 0
    public texScaleX: float = 0
    public texScaleY: float = 0
    public flags: int = 0
    public sideLength: float = 0
    public start: Vector3 = new Vector3()
    public IF: Vector4 = new Vector4()
    public LF: Vector4 = new Vector4()
    public heightMap: float[][] = []
    public alphaMap: float[][] = []

    public constructor(lines?: string[]) {
        if (!lines || lines.length < 3) {
            return
        }

        this.texture = lines[2]!

        switch (lines[0]) {
            case 'terrainDef': {
                for (let i = 2; i < lines.length; ++i) {
                    let line = lines[i]!.split(' ').filter(x => x)
                    switch (line[0]) {
                        case 'TEX(': {
                            this.texture = line[1]!
                            this.textureShiftS = parseFloat(line[2]!)
                            this.textureShiftT = parseFloat(line[3]!)
                            this.texRot = parseFloat(line[4]!)
                            this.texScaleX = parseFloat(line[5]!)
                            this.texScaleY = parseFloat(line[6]!)
                            this.flags = parseInt(line[8]!, 10)
                            break
                        }
                        case 'TD(': {
                            this.sideLength = parseInt(line[1]!, 10)
                            this.start = new Vector3(parseFloat(line[2]!), parseFloat(line[3]!), parseFloat(line[4]!))
                            break
                        }
                        case 'IF(': {
                            this.IF = new Vector4(parseFloat(line[1]!), parseFloat(line[2]!), parseFloat(line[3]!), parseFloat(line[4]!))
                            break
                        }
                        case 'LF(': {
                            this.LF = new Vector4(parseFloat(line[1]!), parseFloat(line[2]!), parseFloat(line[3]!), parseFloat(line[4]!))
                            break
                        }
                        case 'V(': {
                            ++i
                            line = lines[i]!.split(' ').filter(x => x)
                            if (this.side === 0) {
                                this.side = line.length
                            }
                            this.heightMap = generate2dArray(this.side, this.side, 0)
                            for (let j = 0; j < this.side; ++j) {
                                for (let k = 0; k < this.side; ++k) {
                                    this.heightMap[j]![k] = parseFloat(line[k]!)
                                }
                                ++i
                                line = lines[i]!.split(' ').filter(x => x)
                            }
                            break
                        }
                        case 'A(': {
                            ++i
                            line = lines[i]!.split(' ').filter(x => x)
                            if (this.side === 0) {
                                this.side = line.length
                            }
                            this.alphaMap = generate2dArray(this.side, this.side, 0)
                            for (let j = 0; j < this.side; ++j) {
                                for (let k = 0; k < this.side; ++k) {
                                    this.alphaMap[j]![k] = parseFloat(line[k]!)
                                }
                                ++i
                                line = lines[i]!.split(' ').filter(x => x)
                            }
                            break
                        }
                    }
                }
                break
            }
            default: {
                throw new Error(`Unknown terrain type ${lines[0]}!`)
            }
        }
    }
}