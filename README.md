# LibBSP-js

This is a port of the [LibBSP](https://github.com/wfowler1/LibBSP) library that targets the web. As stated in the
original README:
> Library for parsing and reading BSP (Binary Space Partition) structures in Quake-based game engines
>
> The classes in this project exist to parse and store BSP structure information from various formats from many Quake
> engine forks, including Source and Quake 3.

This library has zero dependencies.

This port is mostly a direct translation of the C# code to Typescript. Since we don't have direct access to all the
files on the filesystem of the server or user, a FakeFileSystem was implemented.

Some engines expect additional `.lmp` files. Be sure to add those to the `FakeFileSystem` as well.

Example usage:

```js
FakeFileSystem.baseUrl = 'quake/'
await FakeFileSystem.Init()
await FakeFileSystem.DownloadFile('maps/mymap.bsp')
const myBsp = new BSP(FakeFileSystem.GetFile('maps/mybsp.bsp'))

for (let i = 0; i < myBsp.entities.count; i++) {
    const entity = myBsp.entities.get(i)
    console.log(entity.name, entity.className, entity)
}
```

For more detailed example usage, you can check the code of
the [Unity BSP importer](https://github.com/wfowler1/Unity3D-BSP-Importer).