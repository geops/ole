<?php

class Bootstrap extends Zend_Application_Bootstrap_Bootstrap
{

    protected function _initDatabase() {
        
        $dbConfig = $this->getOption('database');

        $db = Zend_Db::factory($dbConfig['adapter'], $dbConfig['params']);

        // explicitly set the client encoding for the database connection
        $db->query("set client_encoding to 'utf-8'; /*Bootstrap::_initDatabase*/");

        Zend_Db_Table_Abstract::setDefaultAdapter($db);

        $registry = Zend_Registry::getInstance();
        $registry->set('db', $db);
    }

    protected function _initFront() {
        $front = Zend_Controller_Front::getInstance();
        $front->setControllerDirectory(APPLICATION_PATH . '/controllers');
        $front->addModuleDirectory(APPLICATION_PATH . '/modules');
    }

}

