import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/modal.scss'

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null
  }

  const handleClose = () => {
    onClose()
    window.location.reload()
  }

  return (
    <div className="modal-overlay d-flex align-items-center justify-content-center">
      <div className="modal-content position-relative">
        <button
          className="close-modal btn btn-link position-absolute top-0 end-0"
          onClick={handleClose}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal
