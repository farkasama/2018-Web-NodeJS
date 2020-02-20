-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le :  ven. 13 avr. 2018 à 20:41
-- Version du serveur :  5.7.19
-- Version de PHP :  5.6.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `uber`
--

-- --------------------------------------------------------

--
-- Structure de la table `chauffeur`
--

DROP TABLE IF EXISTS `chauffeur`;
CREATE TABLE IF NOT EXISTS `chauffeur` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Nom` varchar(40) NOT NULL,
  `Prenom` varchar(40) NOT NULL,
  `DDN` date NOT NULL,
  `Pseudo` varchar(15) NOT NULL,
  `MDP` varchar(15) NOT NULL,
  `TDV` char(1) NOT NULL,
  `Occupe` char(1) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Pseudo` (`Pseudo`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `client`
--

DROP TABLE IF EXISTS `client`;
CREATE TABLE IF NOT EXISTS `client` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Nom` varchar(40) NOT NULL,
  `Prenom` varchar(40) NOT NULL,
  `DDN` date NOT NULL,
  `Pseudo` varchar(15) NOT NULL,
  `MDP` varchar(15) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Pseudo` (`Pseudo`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `course`
--

DROP TABLE IF EXISTS `course`;
CREATE TABLE IF NOT EXISTS `course` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Adresse_d` text NOT NULL,
  `Adresse_a` text NOT NULL,
  `Date` date NOT NULL,
  `Heure` time NOT NULL,
  `ID_Client` int(11) NOT NULL,
  `ID_Chauffeur` int(11) NOT NULL,
  `EDLC` char(1) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `ID_Client` (`ID_Client`),
  KEY `id_chaffeur` (`ID_Chauffeur`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `course`
--
ALTER TABLE `course`
  ADD CONSTRAINT `ID_Client` FOREIGN KEY (`ID_Client`) REFERENCES `client` (`ID`),
  ADD CONSTRAINT `id_chaffeur` FOREIGN KEY (`ID_Chauffeur`) REFERENCES `chauffeur` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
