
import * as React from 'react'
import { render } from 'react-dom'

import {
    PostCubeBLE,
    PostCubeLogger,
    Platform,
} from '../../../lib'
import { View } from './view'

PostCubeBLE.platform = Platform.web

PostCubeLogger.ignoreDebug = false

render(
    <View/>,
    document.getElementById('application'),
)
