const textDecoder = new TextDecoder()

export class File {
    public readonly originalPath: string
    public readonly caseInsensitivePath: string
    public readonly nameWithExtension: string
    public readonly nameWithoutExtension: string
    public readonly extension: string
    public readonly directory: string
    public bytes: Uint8Array | undefined

    public failedToDownload: boolean = false

    public constructor(path: string) {
        if (path.startsWith('/')) {
            path = path.substring(1)
        }

        this.originalPath = path
        this.caseInsensitivePath = path.toLowerCase()

        this.nameWithExtension = path.split('/').pop()!
        const dotSplit = this.nameWithExtension.split('.')
        this.nameWithoutExtension = dotSplit.shift()!
        this.extension = '.' + dotSplit.pop()
        this.directory = this.originalPath.substring(0, this.originalPath.lastIndexOf('/') + 1)
    }

    public get isLoaded(): boolean {
        if (!this.bytes) return false
        return this.bytes.length > 0
    }

    public get text(): string | null {
        if (!this.isLoaded) {
            return null
        }
        return textDecoder.decode(this.bytes)
    }

    public async download(): Promise<boolean> {
        if (this.failedToDownload) {
            return false
        }
        if (this.isLoaded) {
            return true
        }

        const response = await fetch(FakeFileSystem.baseUrl + this.originalPath.replace('#', '%23'))
        if (!response.ok) {
            this.failedToDownload = true
            return false
        }
        this.bytes = new Uint8Array(await response.arrayBuffer())
        this.failedToDownload = false
        return true
    }
}

export class FakeFileSystem {
    public static baseUrl = './'
    private static fileData = new Map<string, File>()
    private static _hasLoadedIndex = false

    public static get hasLoadedIndex(): boolean {
        return this._hasLoadedIndex
    }

    public static async Init(): Promise<void> {
        if (!this.baseUrl.endsWith('/')) {
            this.baseUrl += '/'
        }

        const response = await fetch(`${this.baseUrl}index`)
        if (response.ok) {
            const text = await response.text()
            const items = text.split(/\r?\n/)
            for (const item of items) {
                this.fileData.set(item.toLowerCase(), new File(item))
            }
            this._hasLoadedIndex = true
        }
    }

    public static FileExists(path: string, loadedOnly: boolean = true): boolean {
        if (!path) {
            return false
        }

        path = path.toLowerCase()
        if (!this.fileData.has(path)) {
            return false
        }
        if (!loadedOnly) {
            return true
        }
        const item = this.fileData.get(path)!
        return item.isLoaded
    }

    public static GetFile(path: string): File | null {
        path = path.toLowerCase()
        if (!this.fileData.has(path)) {
            return null
        }
        return this.fileData.get(path)!
    }

    public static FindFiles(startsWithPath: string, regex?: RegExp, loadedOnly: boolean = true): File[] {
        if (startsWithPath.startsWith('/')) {
            startsWithPath = startsWithPath.substring(1)
        }

        startsWithPath = startsWithPath.toLowerCase()

        let items: File[] = []
        const entries = this.fileData.entries()
        for (const [path, file] of entries) {
            if (path.startsWith(startsWithPath)) {
                if (!regex) {
                    items.push(file)
                } else if (regex.test(path)) {
                    items.push(file)
                }
            }
        }
        if (loadedOnly) {
            items = items.filter(x => x.isLoaded)
        }

        return items
    }

    public static Unload(path: string): void {
        path = path.toLowerCase()

        if (this.fileData.has(path)) {
            this.fileData.delete(path)
        }
    }

    public static UnloadAll(): void {
        this.fileData.clear()
    }

    public static async DownloadFile(file: string | File): Promise<File | null> {
        if (!file) {
            throw new Error('ArgumentNullException')
        }

        let item: File
        if (typeof file === 'string') {
            if (file.startsWith('/')) {
                file = file.substring(1)
            }

            file = file.toLowerCase()

            if (!this.fileData.has(file)) {
                return null
            }

            item = this.fileData.get(file)!
        } else {
            item = file
        }

        if (item.isLoaded) {
            return item
        }

        await item.download()
        return item.failedToDownload ? null : item
    }

    public static async DownloadFiles(paths: (string | File)[]): Promise<(File | null)[]> {
        const promises: Promise<File | null>[] = []
        for (const path of paths) {
            promises.push(this.DownloadFile(path))
        }
        return Promise.all(promises)
    }
}