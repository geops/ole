<?php

/**
 * Model class for geoprocessing requests
 *
 * @copyright  2011 geOps
 * @license    https://github.com/geops/ole/blob/master/license.txt
 * @link       https://github.com/geops/ole
 * @package    Ole
 */

class Ole_ProcessModel_Exception extends Exception {}

class Ole_ProcessModel {

    /**
     * Provides SQL queries for geoprocessing. Will be set by the constructor.
     */
    protected $sql;

    /**
     * Reads and sets SQL queries from JSON file.
     */
    public function __construct() {
        $filename = dirname(dirname(__FILE__)) . '/sql.json';
        $this->sql = json_decode(file_get_contents($filename));
    }

    /**
     * Split path or polygon by a given path.
     *
     * @param  String $geo Geometry as WKT
     * @param  String $cut Path as WKT
     * @return String      Splitted geometry as WKT
     */
    public function split($geo, $cut) {

        $registry = Zend_Registry::getInstance();
        $db = $registry->get('db');
        $type = '';

        if (strpos($geo, 'POLYGON') != false) {
            $type = 'polygon';
        } elseif (strpos($geo, 'LINE') != false) {
            $type = 'line';
        }

        if (!empty($type)) {
            $result = $db->fetchrow($this->sql->split->$type, array(':geo' => $geo, ':cut' => $cut));
            return $result['geo'];
        }
    }

    /**
     * Merge polygons.
     *
     * @param  String $geo Geometry as WKT
     * @return String      Merged geometry as WKT
     */
    public function merge($geo) {

        $registry = Zend_Registry::getInstance();
        $db = $registry->get('db');

        if (strpos($geo, 'POLYGON') != false) {
            $type = 'polygon';
        } elseif (strpos($geo, 'LINE') != false) {
            $type = 'line';
        }

        if (empty($type)) {
            throw new Ole_ProcessModel_Exception('Incompatible geometry type');
        }
        
        $result = $db->fetchrow($this->sql->merge->$type, array(':geo' => $geo));

        if (empty($result['geo'])) {
            // PostGIS >= 1.5 doesn't return an exception, just an empty result
            throw new Ole_ProcessModel_Exception('Could not process geometry.');
        } else {
            return $result['geo'];
        }
    }

    /**
     * Clean geometries.
     *
     * @param  String $geo Geometry as WKT
     * @return String      Cleaned geometry as WKT
     */
    public function clean($geo) {

        $registry = Zend_Registry::getInstance();
        $db = $registry->get('db');

        $result = $db->fetchrow($this->sql->clean, array(':geo' => $geo));
        return $result['geo'];
    }

    /**
     * Verifies that the geometry outline is a valid shape
     *
     * @param string $geoJSON JSON object with geometry
     * @return boolean True, if geometry is valid
     */
    public function ST_IsValid($geoJSON) {
        
        $registry = Zend_Registry::getInstance();
        $db = $registry->get('db');

        $autoloader = Zend_Loader_Autoloader::getInstance();
        $autoloader->pushAutoloader(array('GeoJSON', 'autoload'));
        
        try {
            $geometry = GeoJSON::load($geoJSON);
            $geoWKT = WKT::dump($geometry);
        } catch (Exception $e) {
            return false;
        }

        $result = $db->fetchRow(
            "SELECT ST_IsValid( :geoWKT )::int ;",
            array(
                'geoWKT' => $geoWKT
            ),
            Zend_Db::FETCH_COLUMN
        );
        return (boolean)$result;
    }

    /**
     * States if a geometry is valid or not an if not valid, a reason why
     * Available since PostGIS 1.4 (more dependenices??)
     *
     * @param string $geoJSON JSON object with geometry
     * @return string the reason
     */
    public function ST_IsValidReason($geoJSON) {

        $registry = Zend_Registry::getInstance();
        $db = $registry->get('db');

        $autoloader = Zend_Loader_Autoloader::getInstance();
        $autoloader->pushAutoloader(array('GeoJSON', 'autoload'));

        try {
            $geometry = GeoJSON::load($geoJSON);
            $geoWKT = WKT::dump($geometry);
        } catch (Exception $e) {
            return $e->getMessage();
        }

        $result = $db->fetchOne("SELECT ST_IsValidReason( :geoWKT ) ;",
                array('geoWKT' => $geoWKT));
        return (string)$result;
    }


}
