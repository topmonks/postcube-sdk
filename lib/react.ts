
import { useState, useEffect } from 'react'

import { BoxesAPI } from './boxesApi'

export const useBoxesAPI = (): BoxesAPI => {
    const [ toggle, setToggle ] = useState<boolean>(false)

    const handleBoxAPIChange = () => {
        setToggle(!toggle)
    }

    useEffect(() => {
        BoxesAPI.onChange.listen(handleBoxAPIChange)
        return () =>
            BoxesAPI.onChange.unlisten(handleBoxAPIChange)
    }, [])

    return BoxesAPI
}
