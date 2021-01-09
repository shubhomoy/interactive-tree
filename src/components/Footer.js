import React from 'react'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class Footer extends React.Component {
    render() {
        return(
            <div className="footer">
                Created with <FontAwesomeIcon icon={faHeart} /> by <a target="_blank" rel="noreferrer" href="https://shubhomoy.github.io">Shubhomoy</a>
            </div>
        )
    }
}

export default Footer