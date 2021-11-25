
const { Cubes, Platform } = require('../../build')

Cubes.platform = Platform.node

const main = async() => {
    Cubes.onCubeDiscovered.listen(cube => {
        console.log('New cube! >>', cube)
    })

    const { stopScan } = await Cubes.scanForCubes()

    return new Promise(resolve => setTimeout(() => {
        stopScan()
        resolve()
    }, 5000))
}

main()
    .then(() => console.log('All done!'))
    .catch(console.error)
