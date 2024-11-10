import {Vector2, Vector3} from '../../Util/Vector'
import {Plane} from '../../Util/Plane'
import {TextureInfo} from '../Common/TextureInfo'
import {StringExtensions} from '../../Extensions/StringExtensions'
import {float, int} from '../../Util/number'
import {PlaneExtensions} from '../../Extensions/PlaneExtensions'
import {MAPDisplacement} from './MAPDisplacement'
import {LumpObjDataCtor} from '../Common/ILumpObject'

export class MAPBrushSide {
    public vertices: Vector3[] = []
    public plane: Plane = null!
    public texture: string = null!
    public textureInfo: TextureInfo = null!
    public material: string = null!
    public lgtScale: float = 0
    public lgtRot: float = 0
    public smoothingGroups: int = 0
    public id: int = 0
    public displacement: MAPDisplacement = null!

    public constructor(lines?: string[]) {
        if (!lines) {
            return
        }

        // If lines.Length is 1, then this line contains all data for a brush side
        if (lines.length === 1) {
            const tokens = StringExtensions.SplitUnlessInContainer(lines[0]!, ' ', '"', true)

            // If this succeeds, assume brushDef3
            const dist = parseFloat(tokens[4]!)
            if (!isNaN(dist)) {
                this.plane = new Plane(new Vector3(parseFloat(tokens[1]!), parseFloat(tokens[2]!), parseFloat(tokens[3]!)), dist)
                this.textureInfo = TextureInfo.CreateFromProps(new Vector3(parseFloat(tokens[8]!), parseFloat(tokens[9]!), parseFloat(tokens[10]!)),
                    new Vector3(parseFloat(tokens[13]!), parseFloat(tokens[14]!), parseFloat(tokens[15]!)),
                    new Vector2(0, 0),
                    new Vector2(1, 1),
                    0, 0, 0)
                this.texture = tokens[18]!
            } else {
                const v1 = new Vector3(parseFloat(tokens[1]!), parseFloat(tokens[2]!), parseFloat(tokens[3]!))
                const v2 = new Vector3(parseFloat(tokens[6]!), parseFloat(tokens[7]!), parseFloat(tokens[8]!))
                const v3 = new Vector3(parseFloat(tokens[11]!), parseFloat(tokens[12]!), parseFloat(tokens[13]!))
                this.vertices = [v1, v2, v3]
                this.plane = PlaneExtensions.CreateFromVertices(v1, v2, v3)
                this.texture = tokens[15]!
                // GearCraft
                if (tokens[16] === '[') {
                    this.textureInfo = TextureInfo.CreateFromProps(new Vector3(parseFloat(tokens[17]!), parseFloat(tokens[18]!), parseFloat(tokens[19]!)),
                        new Vector3(parseFloat(tokens[23]!), parseFloat(tokens[24]!), parseFloat(tokens[25]!)),
                        new Vector2(parseFloat(tokens[20]!), parseFloat(tokens[26]!)),
                        new Vector2(parseFloat(tokens[29]!), parseFloat(tokens[30]!)),
                        parseInt(tokens[31]!, 10), 0, parseFloat(tokens[28]!))
                    this.material = tokens[32]!
                } else {
                    //<x_shift> <y_shift> <rotation> <x_scale> <y_scale> <content_flags> <surface_flags> <value>
                    const axes = TextureInfo.TextureAxisFromPlane(this.plane)
                    this.textureInfo = TextureInfo.CreateFromProps(axes[0]!,
                        axes[1]!,
                        new Vector2(parseFloat(tokens[16]!), parseFloat(tokens[17]!)),
                        new Vector2(parseFloat(tokens[19]!), parseFloat(tokens[20]!)),
                        parseInt(tokens[22]!, 10), 0, parseFloat(tokens[18]!))
                }
            }
        } else {
            let inDispInfo = false
            let braceCount = 0
            this.textureInfo = new TextureInfo(new LumpObjDataCtor(new Uint8Array(), undefined))
            let child = []
            for (const line of lines) {
                if (line === '{') {
                    ++braceCount
                } else if (line === '}') {
                    --braceCount
                    if (braceCount === 1) {
                        child.push(line)
                        this.displacement = new MAPDisplacement(child)
                        child = []
                        inDispInfo = false
                    }
                } else if (line === 'dispinfo') {
                    inDispInfo = true
                    continue
                }

                if (braceCount === 1) {
                    const tokens = StringExtensions.SplitUnlessInContainer(line, ' ', '"', true)
                    switch (tokens[0]) {
                        case 'material': {
                            this.texture = tokens[1]!
                            break
                        }
                        case 'plane': {
                            const points = StringExtensions.SplitUnlessBetweenDelimiters(tokens[1]!, ' ', '(', ')', true)
                            let components = points[0]!.split(' ').filter(x => x)
                            const v1 = new Vector3(parseFloat(components[0]!), parseFloat(components[1]!), parseFloat(components[2]!))
                            components = points[1]!.split(' ').filter(x => x)
                            const v2 = new Vector3(parseFloat(components[0]!), parseFloat(components[1]!), parseFloat(components[2]!))
                            components = points[2]!.split(' ').filter(x => x)
                            const v3 = new Vector3(parseFloat(components[0]!), parseFloat(components[1]!), parseFloat(components[2]!))
                            this.plane = PlaneExtensions.CreateFromVertices(v1, v2, v3)
                            break
                        }
                        case 'uaxis': {
                            let split = StringExtensions.SplitUnlessBetweenDelimiters(tokens[1]!, ' ', '[', ']', true)
                            this.textureInfo.scale = new Vector2(parseFloat(split[1]!), this.textureInfo.scale.y)
                            split = split[0]!.split(' ').filter(x => x)
                            this.textureInfo.uAxis = new Vector3(parseFloat(split[0]!), parseFloat(split[1]!), parseFloat(split[2]!))
                            this.textureInfo.translation = new Vector2(parseFloat(split[3]!), this.textureInfo.translation.y)
                            break
                        }
                        case 'vaxis': {
                            let split = StringExtensions.SplitUnlessBetweenDelimiters(tokens[1]!, ' ', '[', ']', true)
                            this.textureInfo.scale = new Vector2(this.textureInfo.scale.x, parseFloat(split[1]!))
                            split = split[0]!.split(' ').filter(x => x)
                            this.textureInfo.vAxis = new Vector3(parseFloat(split[0]!), parseFloat(split[1]!), parseFloat(split[2]!))
                            this.textureInfo.translation = new Vector2(this.textureInfo.translation.x, parseFloat(split[3]!))
                            break
                        }
                        case 'rotation': {
                            this.textureInfo.rotation = parseFloat(tokens[1]!)
                            break
                        }
                    }
                } else if (braceCount > 1) {
                    if (inDispInfo) {
                        child.push(line)
                    }
                }
            }
        }
    }
}