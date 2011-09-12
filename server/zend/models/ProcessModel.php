<?php

/**
 * Model class for geoprocessing requests
 *
 * @copyright  2010 geOps GeoInformatics
 * @license    http://www.geops.de/license.txt
 * @version    $Id$
 * @link       http://www.geops.de
 * @since      File available since Release initial
 * @package    Geo_Ps
 */

class Ole_ProcessModel {
    
    protected $sql;


    public function __construct() {
        $filename = dirname(dirname(__FILE__)) . '/sql.json';
        $this->sql = json_decode(file_get_contents($filename));
    }

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
 
    public function merge($geo) {

        $registry = Zend_Registry::getInstance();
        $db = $registry->get('db');

        if (strpos($geo, 'POLYGON') != false) {
            $type = 'polygon';
        } elseif (strpos($geo, 'LINE') != false) {
            $type = 'line';
        }

        if (!empty($type)) {
            $result = $db->fetchrow($this->sql->merge->$type, array(':geo' => $geo));
            return $result['geo'];
        }
    }

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
