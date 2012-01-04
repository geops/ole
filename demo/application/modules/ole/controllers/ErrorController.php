<?php
/**
 * Error controller - returning restful http status codes instead of phps
 * default stacktraces.
 *
 * @copyright  2011 geOps
 * @license    https://github.com/geops/ole/blob/master/license.txt
 * @link       https://github.com/geops/ole
 * @package    Ole
 */

/**
 * Restful error controller
 *
 * @copyright  2011 geOps
 * @license    https://github.com/geops/ole/blob/master/license.txt
 * @link       https://github.com/geops/ole
 * @package    Ole
 */
class Ole_ErrorController extends Zend_Controller_Action {
 

  /**
  * default error dispatcher
  *
  * outputs - hopefully - meaningful error messages with
  * status codes
  */ 
  public function errorAction() {
    $this->_helper->viewRenderer->setNoRender(true);
    
    $error = $this->_getParam('error_handler');
    $append_strace = False;
    
    $resp = $this->getResponse();
    $resp->setHeader('Content-Type', 'text/plain');

    switch(get_class($error->exception)) {
      case 'PageNotFoundException':
        $resp->setRawHeader('HTTP/1.1 404 Not Found');
        break;
        
      case 'MissingDataException':
        $resp->setRawHeader('HTTP/1.1 500 Internal Server Error');
        break;
        
      case 'TransformException':
        $resp->setRawHeader('HTTP/1.1 500 Internal Server Error');
        break;
 
      default:
        $resp->setRawHeader('HTTP/1.1 500 Internal Server Error');
        $append_strace = True;
        break;
    }
    $resp->sendHeaders();

    echo $error->exception->getMessage();
    if ($append_strace) {
      echo "\n";
      echo $error->exception->getTraceAsString();
    } 
  }
}


