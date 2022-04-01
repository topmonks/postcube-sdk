
import * as React from 'react'

import { PostCubeBLE, PostCube } from './apiBLE'

export const usePostCubeBLE = (onCubeDiscovery = (postCube) => {}) => {
    const [ toggle, setToggle ] = React.useState(false)

    const handlePostCubeBLEChange = () => {
        setToggle(!toggle)
    }

    React.useEffect(() => {
        PostCubeBLE.onChange.listen(handlePostCubeBLEChange)
        return () =>
            PostCubeBLE.onChange.unlisten(handlePostCubeBLEChange)
    }, [])

    React.useEffect(() => {
        if (typeof onCubeDiscovery === 'function') {
            PostCubeBLE.onCubeDiscovered.listen(onCubeDiscovery)
            return () =>
                PostCubeBLE.onCubeDiscovered.unlisten(onCubeDiscovery)
        }
    }, [onCubeDiscovery])

    return PostCubeBLE
}

export const usePostCube = (postCube: PostCube) => {
    const [ _postCube, setPostCube ] = React.useState(postCube)

    const handlePostCubeChange = () => {
        setPostCube(postCube)
    }

    React.useEffect(() => {
        setPostCube(postCube)

        if (!postCube) {
            return
        }

        postCube.onChange.listen(handlePostCubeChange)
        return () =>
            postCube.onChange.unlisten(handlePostCubeChange)
    }, [postCube])

    return _postCube
}
