<?php
/**
 * Controller provides spatial processing functions.
 *
 * @copyright  2010 geOps
 * @license    https://github.com/geops/ole/blob/master/license.txt
 * @link       https://github.com/geops/ole
 * @package    Ole
 */

class Ole_ProcessController_Exception extends Exception {}

/**
 * Exception to be thrown when basic data
 * is not available / not found
 *
 * These exceptions mainly exist to distiguish between error codes
 * in the Errorcontroller
 */
class Ole_ProcessController_PageNotFoundException extends Ole_ProcessController_Exception {

}

/**
 * Excaption when some implied parameters art not set.
 *
 * These exceptions mainly exist to distiguish between error codes
 * in the Errorcontroller
 */
class Ole_ProcessController_MissingDataException extends Ole_ProcessController_Exception {}

class Ole_ProcessController_UploadException extends Ole_ProcessController_Exception {}
class Ole_ProcessController_MissingUploadException extends Ole_ProcessController_UploadException {}
class Ole_ProcessController_UploadSizeException extends Ole_ProcessController_UploadException {}

class Ole_ProcessController_MissingConfigException extends Ole_ProcessController_Exception {}


class Ole_ProcessController_ZipException extends Ole_ProcessController_Exception {}
class Ole_ProcessController_ShapeToGeojsonException extends Ole_ProcessController_Exception {}


class Ole_ProcessController extends Zend_Controller_Action {

    public function preDispatch() {
        require_once dirname(dirname(__FILE__)) . '/models/ProcessModel.php';
    }


    /**
     * Split a path or polygon named "geo" by a given path named "cut".
     * Both geometries need to be encoded as WKT.
     *
     * Returns a JSON string containing an error, a geo and a messsage property.
     */
    public function splitAction() {

        $geo = $this->_request->getParam('geo');
        $cut = $this->_request->getParam('cut');

        try {
            $processModel = new Ole_ProcessModel();
            $processed = $processModel->split($geo, $cut);
            $response = array('error' => false, 'geo' => $processed, 'message' => 'split successful');
        }
        catch(Exception $e) {
            $response = array('error' => true, 'message' => 'Could not process geometry.');
        }

        $this->getHelper('Json')->sendJson($response);
    }

    /**
     * Merge multiple overlapping geometries of the same type into one geometry.
     * The source geometries need to be encoded as WKT and named "geo".
     *
     * Returns a JSON string containing an error, a geo and a messsage property.
     */
    public function mergeAction() {

        $geo = $this->_request->getParam('geo');

        try {
            $processModel = new Ole_ProcessModel();
            $processed = $processModel->merge($geo);
            $response = array('error' => false, 'geo' => $processed, 'message' => 'merge successful');
        }
        catch(Exception $e) {
            $response = array('error' => true, 'message' => 'Could not process geometry.');
        }

        $this->getHelper('Json')->sendJson($response);
    }

    /**
     * Clean up multiple geometries encoded as WKT and named "geo".
     *
     * Returns a JSON string containing an error, a geo and a messsage property.
     */
    public function cleanAction() {

        $geo = $this->_request->getParam('geo');

        try {
            $processModel = new Ole_ProcessModel();
            $processed = $processModel->clean($geo);
            $response = array('error' => false, 'geo' => $processed, 'message' => 'clean successful');
        }
        catch(Exception $e) {
            $response = array('error' => true, 'message' => 'Could not process geometry.');
        }

        $this->getHelper('Json')->sendJson($response);
    }

    /**
     * convert a shapefile to geojson
     */
    public function shp2jsonAction() {

        $dataType = $this->_request->getParam('dataType');

        $response = array();

        // name for the temporary directory -- initializing the variable
        $import_tmpdir = Null;

        try {
            // get all needed config values
            $config = Zend_Registry::get("config");
            if (empty($config->path->ogr2ogr)) {
                throw new Ole_ProcessController_MissingConfigException("ogr2ogr is not configured");
            };
            $ogr2ogr_path = $config->path->ogr2ogr;

            if (empty($config->directory->tmp)) {
                throw new Ole_ProcessController_MissingConfigException("the temporary directory is not configured");
            };
            $tmpdir_path = $config->directory->tmp;

            // build the name for the temp dir for this upload
            $import_tmpdir = rtrim($tmpdir_path, '/') . "/shpimport_" . md5(time() . rand());
            mkdir($import_tmpdir);

            // prepare the filetransfer
            $filetransfer = new Zend_File_Transfer_Adapter_Http();
            $filetransfer->setDestination($import_tmpdir);
            $filetransfer->receive();

            if (!$filetransfer->isUploaded("shp")) {
                throw new Ole_ProcessController_MissingUploadException();
            }

            // limit the upload size
            if ($filetransfer->getFileSize('shp')>=204800) {
                throw new Ole_ProcessController_UploadSizeException();
            }

            // extract the shapefile
            $shp_name = $this->extractShape($filetransfer->getFileName('shp'), $import_tmpdir);
            if (empty($shp_name)) {
                throw new Ole_ProcessController_MissingUploadException(
                    "the zipfile does not seem to contain a shapefile"
                );
            }

            // read shapefile
            $response["geo"]        = $this->shapeToGeojson($shp_name, $ogr2ogr_path, $import_tmpdir);

            $response["success"]    = True;
            $response["msg"]        = "Shapefile successfully uploaded";

        }
        catch (Ole_ProcessController_MissingConfigException $e) {
            $response["success"]    = False;
            $response["msg"]        = "Missing Configuration : " . $e->getMessage();
        }
        catch (Ole_ProcessController_MissingUploadException $e) {
            $response["success"]    = False;
            $response["msg"]        = "No shapefile uploaded :" . $e->getMessage();
        }
        catch (Ole_ProcessController_UploadSizeException $e) {
            $response["success"]    = False;
            $response["msg"]        = "the shapefile uploaded is too big";
        }
        catch (Ole_ProcessController_ZipException $e) {
            $response["success"]    = False;
            $response["msg"]        = "error opening zipfile : " . $e->getMessage();
        }
        catch (Ole_ProcessController_ShapeToGeojsonException $e) {
            $response["success"]    = False;
            $response["msg"]        = "error reading the shapefile : " . $e->getMessage();
        }




        // remove the temporary files. they will not get removed on uncaught exceptions
        // because PHP lacks a finally block
        if (!empty($import_tmpdir)) {
            $this->recursiveRmDir($import_tmpdir);
        }

        // send html to enable ajax upload
        if ($dataType == 'html') {
            $this->getHelper('Layout')->disableLayout();
            $this->view->assign('json', json_encode($response));
        } else {
            $this->getHelper('Json')->sendJson($response);
        }

    }


    /**
     * extracts the zipped shapefile to the given directory and returns
     * the path to the first *.shp file found.
     *
     * if no shp file is in the archive, the return value will be Null
     */
    protected function extractShape($zipfile, $targetdir) {

            // name of the shapefile in the archive
            $shape_name = Null;

            // DEPENDS: php zip extension (zip_open)
            $zip = zip_open($zipfile);

            if (!is_resource($zip)) {
                throw new Ole_ProcessController_ZipException("the zip file could not be opened");
            }

            while ($zip_entry = zip_read($zip)) {

                $filename =$targetdir.'/'.zip_entry_name($zip_entry);

                // create subdirectories as necessary to handle directories inside the zip file
                $filename_dir = dirname($filename);
                if (!is_dir($filename_dir)) {
                    mkdir($filename_dir, 0777, true);
                }

                if ($filename[strlen($filename)-1] != '/') {

                    $fp = fopen($filename, "w");
                    if (!is_resource($fp)) {
                        zip_close($zip);
                        throw new Ole_ProcessController_ZipException("could not open $filename for writing");
                    }

                    if (zip_entry_open($zip, $zip_entry, "r")) {
                        $buf = zip_entry_read($zip_entry, zip_entry_filesize($zip_entry));
                        fwrite($fp, "$buf");
                        zip_entry_close($zip_entry);
                    }
                    else {
                        fclose($fp);
                        zip_close($zip);
                        throw new Ole_ProcessController_ZipException("contents of the zip archive could not be read");
                    }

                    fclose($fp);
                }

                // try to find the main file of the shape
                if (empty($shape_name)) {
                    if (preg_match('/\.shp$/i', $filename)) {
                        $shape_name = $filename;
                    }
                }
            }

            zip_close($zip);

            return $shape_name;
        }


    /**
     * convert the $shapefile to a GeoJson object
     *
     * tries to handle encoding issues
     *
     * will not delete its temporary files
     */
    protected function shapeToGeojson($shapefile, $ogr2ogr_path, $tmpdir_path) {

        // temporary output file for the geojson data
        $outfile = rtrim($tmpdir_path) . "/jsonout.json";
        if (is_file($outfile)) { // should not happen
            unlink($outfile);
        }
        $layername = preg_replace('/\.shp$/i', '', basename($shapefile));

        $cmd_array = array(
            $ogr2ogr_path,
            '-f', 'GeoJSON'
        );

        // perfrom a transformation if the shapefile contains a prj file/ projection is known
        $prj_file = Null;
        $_prj_file_name = basename(preg_replace('/\.shp$/i', '.prj', $shapefile));
        // case sensitive search for the prj file
        foreach(scandir(dirname($shapefile)) as $p_prj_file) {
            if (stristr($p_prj_file , $_prj_file_name) !== FALSE) {
                $prj_file = $_prj_file_name;
                break;
            }
        }

        if (!empty($prj_file)) {
            // ogr2ogr does not seem to be able to transform without source srs,
            // even when prj file exists. so we will explicitly assign it here
            $cmd_array[] = '-t_srs';
            $cmd_array[] = 'EPSG:'.SRID;
        }
        else {
            // assume its SRID
            $cmd_array[] = '-a_srs';
            $cmd_array[] = 'EPSG:'.SRID;
        }


        $cmd_array[] = $outfile;
        $cmd_array[] = $shapefile;
        $cmd_array[] = $layername;
        $cmd_command = implode(' ', $cmd_array);

        $cmd_ret    = Null;
        $cmd_output = Null;

        // DEPENDS: ogr2ogr
        // run the command and catch returncode + output
        exec(
            $cmd_command,
            $cmd_output,
            $cmd_ret
        );
        if ($cmd_ret != 0) {
            $cmd_output_str = '';
            if (is_array($cmd_output)) {
                $cmd_output_str = implode("\n", $cmd_output);
            }
            else {
                $cmd_output_str = $cmd_output;
            }

            throw new Ole_ProcessController_ShapeToGeojsonException(
                "ogr2ogr failed [$cmd_command] : " . $cmd_output_str
            );
        }

        $geojson_str =  file_get_contents($outfile);
        if (empty($geojson_str)) {
            throw new Ole_ProcessController_ShapeToGeojsonException(
                "ogr2ogr did not produce any ouput"
            );
        }

        // handle encoding
        // DEPENDS: PHP mb_string functions
        $geoEncoding = mb_detect_encoding($geojson_str);
        if ($geoEncoding) {
            $geojson_str = mb_convert_encoding($geojson_str, "UTF-8", $geoEncoding);
        }
        else {
            $geojson_str = mb_convert_encoding($geojson_str, "UTF-8");
        }

        // reduce json size by stripping properties
        $geoJSON = json_decode($geojson_str);
        if (is_null($geoJSON)) {
            throw new Ole_ProcessController_ShapeToGeojsonException(
                "the json produced by ogr2ogr could not be decoded."
            );
        }
        $geoJSON->properties = null;
        foreach ($geoJSON->features as &$feature) {
            $feature->properties = null;
        }

        return $geoJSON;
    }

    protected function recursiveRmDir($dir) {
        if (is_dir($dir)) {
            $objects = scandir($dir);
            foreach ($objects as $object) {
                if ($object != "." && $object != "..") {
                    if (filetype($dir."/".$object) == "dir") {
                        $this->recursiveRmDir($dir."/".$object);
                    }
                    else {
                        unlink($dir."/".$object);
                    }
                }
            }
            reset($objects);
            rmdir($dir);
        }
    }
}
