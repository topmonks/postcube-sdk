
import * as React from 'react'
import { unionBy } from 'lodash'
import cx from 'classnames'

import { PostCube } from '../../../../lib'
import { usePostCube } from '../hooks'
import { PanelLogs } from './panelLogs'
import { PanelSelectedPostCube } from './panelSelectedPostCube'
import { PanelScan } from './panelScan'

// export interface ViewProps {}
export const View = ({}) => {
    const [ selectedPostCube, setSelectedPostCube ] = React.useState<PostCube>()

    const postCube = usePostCube(selectedPostCube)

    return (
        <div className='bg-gray-200 min-h-screen'>
            <div className='text-4xl mx-48 pt-6'>PostCube Debugger</div>
            <PanelScan
                onPostCubeSelect={async(postCube) => {
                    await postCube.connect()
                    setSelectedPostCube(postCube)
                }}
            />
            {postCube && (
                <PanelSelectedPostCube postCube={postCube} />
            )}
            <PanelLogs/>
        </div>
    )
}
