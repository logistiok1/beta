
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!50717 SELECT COUNT(*) INTO @rocksdb_has_p_s_session_variables FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'performance_schema' AND TABLE_NAME = 'session_variables' */;
/*!50717 SET @rocksdb_get_is_supported = IF (@rocksdb_has_p_s_session_variables, 'SELECT COUNT(*) INTO @rocksdb_is_supported FROM performance_schema.session_variables WHERE VARIABLE_NAME=\'rocksdb_bulk_load\'', 'SELECT 0') */;
/*!50717 PREPARE s FROM @rocksdb_get_is_supported */;
/*!50717 EXECUTE s */;
/*!50717 DEALLOCATE PREPARE s */;
/*!50717 SET @rocksdb_enable_bulk_load = IF (@rocksdb_is_supported, 'SET SESSION rocksdb_bulk_load = 1', 'SET @rocksdb_dummy_bulk_load = 0') */;
/*!50717 PREPARE s FROM @rocksdb_enable_bulk_load */;
/*!50717 EXECUTE s */;
/*!50717 DEALLOCATE PREPARE s */;
DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `icon` varchar(255) NOT NULL,
  `cond_type` varchar(50) NOT NULL,
  `cond_target_id` int DEFAULT '0',
  `cond_value` int NOT NULL,
  `bonus_dmg` int DEFAULT '0',
  `bonus_hp` int DEFAULT '0',
  `bonus_def` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `arena_cooldowns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `arena_cooldowns` (
  `user_id` int NOT NULL,
  `target_id` int NOT NULL,
  `last_fight` int NOT NULL,
  PRIMARY KEY (`user_id`,`target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `arena_shop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `arena_shop` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `price` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `auction_lots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auction_lots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seller_id` int NOT NULL,
  `item_id` int NOT NULL,
  `type` varchar(20) NOT NULL,
  `quantity` int DEFAULT '1',
  `price` int NOT NULL,
  `upgrade_level` int DEFAULT '0',
  `bonus_dmg` int DEFAULT '0',
  `bonus_hp` int DEFAULT '0',
  `bonus_def` int DEFAULT '0',
  `created_at` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `clan_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clan_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clan_id` int NOT NULL,
  `user_id` int NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `action_type` enum('donate','upgrade','create','join') NOT NULL,
  `amount` int DEFAULT '0',
  `message` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `clans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `leader_id` int NOT NULL,
  `level` int DEFAULT '1',
  `gold` int DEFAULT '0',
  `is_open` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `building_hall` int DEFAULT '0',
  `building_armory` int DEFAULT '0',
  `building_barracks` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `craft_materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `craft_materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipe_id` int NOT NULL,
  `material_item_id` int NOT NULL,
  `amount` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `craft_recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `craft_recipes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `result_item_id` int NOT NULL,
  `gold_cost` int NOT NULL DEFAULT '0',
  `min_level` int NOT NULL DEFAULT '1',
  `category` enum('weapon','head','body','legs','amulet','ring') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `daily_rewards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_rewards` (
  `day_number` int NOT NULL,
  `reward_type` enum('gold','item') NOT NULL,
  `reward_value` int NOT NULL,
  `img` varchar(255) NOT NULL,
  PRIMARY KEY (`day_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `dungeon_cooldowns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dungeon_cooldowns` (
  `user_id` int NOT NULL,
  `dungeon_id` int NOT NULL,
  `cooldown_end` int NOT NULL,
  PRIMARY KEY (`user_id`,`dungeon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `dungeon_drops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dungeon_drops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dungeon_id` int NOT NULL,
  `item_id` int NOT NULL,
  `chance` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `dungeons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dungeons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `img` varchar(100) NOT NULL,
  `location_id` int NOT NULL DEFAULT '1',
  `loc_x` int NOT NULL,
  `loc_y` int NOT NULL,
  `boss_name` varchar(100) NOT NULL,
  `boss_img` varchar(100) NOT NULL,
  `boss_hp` int NOT NULL,
  `boss_max_hp` int NOT NULL,
  `boss_damage` int NOT NULL,
  `boss_defense` int NOT NULL,
  `attack_interval` int NOT NULL DEFAULT '2',
  `respawn_time` int NOT NULL DEFAULT '600',
  `death_time` int NOT NULL DEFAULT '0',
  `gold_min` int NOT NULL DEFAULT '10',
  `gold_max` int NOT NULL DEFAULT '50',
  `exp_min` int NOT NULL DEFAULT '50',
  `exp_max` int NOT NULL DEFAULT '100',
  `offset_x` int DEFAULT '0',
  `offset_y` int DEFAULT '0',
  `font_size` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `equipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipment` (
  `user_id` int NOT NULL,
  `slot_head` int DEFAULT '0',
  `slot_body` int DEFAULT '0',
  `slot_legs` int DEFAULT '0',
  `slot_weapon` int DEFAULT '0',
  `slot_amulet` int DEFAULT '0',
  `slot_ring` int DEFAULT '0',
  `slot_wings` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `forum_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text,
  `can_create_topics` tinyint DEFAULT '1',
  `created_at` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `forum_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `target_type` enum('topic','message') NOT NULL,
  `target_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_like` (`user_id`,`target_type`,`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `forum_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `topic_id` int NOT NULL,
  `user_id` int NOT NULL,
  `message` text NOT NULL,
  `created_at` int NOT NULL,
  `likes` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `forum_topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_topics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `created_at` int NOT NULL,
  `is_closed` tinyint DEFAULT '0',
  `likes` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `friends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `friends` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id_1` int NOT NULL,
  `user_id_2` int NOT NULL,
  `status` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `global_chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `global_chat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `channel` varchar(20) DEFAULT 'general',
  `message` text,
  `item_data` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `item_id` int DEFAULT NULL,
  `upgrade_level` int DEFAULT '0',
  `bonus_dmg` int DEFAULT '0',
  `bonus_hp` int DEFAULT '0',
  `bonus_def` int DEFAULT '0',
  `is_equipped` tinyint DEFAULT '0',
  `quantity` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=307 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  `type` varchar(20) DEFAULT NULL,
  `rarity` varchar(20) DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `damage` int DEFAULT '0',
  `defense` int DEFAULT '0',
  `hp_bonus` int DEFAULT '0',
  `price` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `img` varchar(255) NOT NULL DEFAULT 'loc_spawn.jpg',
  `min_level` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `login_offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `bg_image` varchar(255) DEFAULT 'promo_bg_1.jpg',
  `old_price` int NOT NULL DEFAULT '0',
  `new_price` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `item_1_id` int NOT NULL,
  `item_1_qty` int DEFAULT '1',
  `item_2_id` int DEFAULT '0',
  `item_2_qty` int DEFAULT '0',
  `item_3_id` int DEFAULT '0',
  `item_3_qty` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `mob_drops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mob_drops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mob_id` int DEFAULT NULL,
  `item_id` int DEFAULT NULL,
  `chance` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `mobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `loc_x` int DEFAULT NULL,
  `loc_y` int DEFAULT NULL,
  `hp` int DEFAULT NULL,
  `max_hp` int DEFAULT NULL,
  `damage` int DEFAULT NULL,
  `defense` int DEFAULT NULL,
  `attack_interval` float DEFAULT NULL,
  `gold_min` int DEFAULT NULL,
  `gold_max` int DEFAULT NULL,
  `exp_min` int DEFAULT NULL,
  `exp_max` int DEFAULT NULL,
  `respawn_time` int DEFAULT NULL,
  `death_time` int DEFAULT '0',
  `location_id` int DEFAULT '1',
  `level` int NOT NULL DEFAULT '1',
  `offset_x` int DEFAULT '0',
  `offset_y` int DEFAULT '0',
  `font_size` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `npcs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `npcs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `img` varchar(255) DEFAULT 'npc_default.png',
  `loc_x` int DEFAULT '0',
  `loc_y` int DEFAULT '0',
  `location_id` int DEFAULT '1',
  `type` varchar(20) DEFAULT 'quest',
  `offset_x` int DEFAULT '0',
  `offset_y` int DEFAULT '0',
  `font_size` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `img` varchar(50) NOT NULL,
  `base_dmg` int DEFAULT '0',
  `base_hp` int DEFAULT '0',
  `base_def` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `premium_shop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `premium_shop` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tab` enum('promo','cosmetic','pet','resource') NOT NULL,
  `item_id` int NOT NULL,
  `price` int NOT NULL,
  `old_price` int DEFAULT '0',
  `promo_end` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `private_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `private_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `quest_item_rewards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quest_item_rewards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quest_id` int NOT NULL,
  `item_id` int NOT NULL,
  `count` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `quests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `npc_id` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text,
  `target_mob_id` int NOT NULL,
  `target_count` int DEFAULT '1',
  `reward_gold` int DEFAULT '0',
  `reward_exp` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `storage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  `expires_at` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=150 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `teleport_destinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teleport_destinations` (
  `teleport_id` int NOT NULL,
  `location_id` int NOT NULL,
  PRIMARY KEY (`teleport_id`,`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `teleports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teleports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT 'Portal',
  `img` varchar(255) DEFAULT 'portal.png',
  `from_loc_id` int NOT NULL,
  `from_x` int NOT NULL,
  `from_y` int NOT NULL,
  `to_loc_id` int NOT NULL,
  `to_x` int NOT NULL,
  `to_y` int NOT NULL,
  `offset_x` int DEFAULT '0',
  `offset_y` int DEFAULT '0',
  `font_size` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tower_drops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tower_drops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `level_id` int NOT NULL,
  `item_id` int NOT NULL,
  `chance` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tower_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tower_levels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `level_number` int NOT NULL,
  `mob_name` varchar(100) NOT NULL,
  `mob_img` varchar(100) NOT NULL,
  `mob_hp` int NOT NULL,
  `mob_damage` int NOT NULL,
  `mob_exp` int NOT NULL,
  `mob_gold` int NOT NULL,
  `rewards_json` text COMMENT 'JSON: [{"item_id":1, "chance":50}, ...]',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `user_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_achievements` (
  `user_id` int NOT NULL,
  `achievement_id` int NOT NULL,
  `progress` int DEFAULT '0',
  `is_completed` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`user_id`,`achievement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `user_arena_battle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_arena_battle` (
  `user_id` int NOT NULL,
  `opp_id` int NOT NULL,
  `opp_current_hp` int NOT NULL,
  `opp_max_hp` int NOT NULL,
  `opp_dmg` int NOT NULL,
  `opp_def` int NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `user_pets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_pets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `pet_id` int NOT NULL,
  `level` int DEFAULT '1',
  `is_summoned` tinyint DEFAULT '0',
  `exp` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `user_purchased_offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_purchased_offers` (
  `user_id` int NOT NULL,
  `offer_id` int NOT NULL,
  `purchased_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`offer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `user_quests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_quests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `quest_id` int NOT NULL,
  `current_count` int DEFAULT '0',
  `status` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `user_tower_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_tower_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `level_number` int NOT NULL,
  `last_attempt` int NOT NULL DEFAULT '0',
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `current_mob_hp` int DEFAULT '0',
  `cooldown_until` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `user_visited_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_visited_locations` (
  `user_id` int NOT NULL,
  `location_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `class_type` varchar(20) NOT NULL,
  `loc_x` int DEFAULT '0',
  `loc_y` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `level` int DEFAULT '1',
  `exp` int DEFAULT '0',
  `next_level_exp` int DEFAULT '100',
  `hp` int DEFAULT '100',
  `max_hp` int DEFAULT '100',
  `damage` float DEFAULT '1',
  `defense` int DEFAULT '0',
  `gold` int DEFAULT '0',
  `last_regen` int DEFAULT '0',
  `last_active` int DEFAULT '0',
  `location_id` int DEFAULT '1',
  `daily_day` int DEFAULT '1',
  `last_daily_claim` int DEFAULT '0',
  `clan_id` int DEFAULT NULL,
  `skill_points` int DEFAULT '0',
  `skill_1_lvl` int DEFAULT '0',
  `skill_2_lvl` int DEFAULT '0',
  `skill_3_lvl` int DEFAULT '0',
  `arena_coins` int DEFAULT '0',
  `arena_league` int DEFAULT '1',
  `arena_points` int DEFAULT '0',
  `arena_wins` int DEFAULT '0',
  `arena_energy` int DEFAULT '5',
  `last_arena_energy` int DEFAULT '0',
  `valor` int DEFAULT '0',
  `active_outfit` varchar(255) DEFAULT NULL,
  `active_background` varchar(255) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'player',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `world_boss_drops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `world_boss_drops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `boss_id` int NOT NULL,
  `item_id` int NOT NULL,
  `chance` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `world_bosses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `world_bosses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `img` varchar(100) NOT NULL,
  `level` int DEFAULT '10',
  `max_hp` int NOT NULL,
  `hp` int NOT NULL,
  `min_damage` int NOT NULL,
  `max_damage` int NOT NULL,
  `defense` int NOT NULL,
  `location_id` int NOT NULL,
  `loc_x` int NOT NULL,
  `loc_y` int NOT NULL,
  `respawn_time` int NOT NULL DEFAULT '3600',
  `death_time` int DEFAULT '0',
  `offset_x` int DEFAULT '0',
  `offset_y` int DEFAULT '0',
  `font_size` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `world_resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `world_resources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `type` enum('tree','rock','ore') NOT NULL,
  `img` varchar(50) NOT NULL,
  `location_id` int NOT NULL DEFAULT '1',
  `loc_x` int NOT NULL,
  `loc_y` int NOT NULL,
  `respawn_time` int NOT NULL DEFAULT '60',
  `min_yield` int NOT NULL DEFAULT '1',
  `max_yield` int NOT NULL DEFAULT '3',
  `drop_item_id` int NOT NULL,
  `last_gathered` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50112 SET @disable_bulk_load = IF (@is_rocksdb_supported, 'SET SESSION rocksdb_bulk_load = @old_rocksdb_bulk_load', 'SET @dummy_rocksdb_bulk_load = 0') */;
/*!50112 PREPARE s FROM @disable_bulk_load */;
/*!50112 EXECUTE s */;
/*!50112 DEALLOCATE PREPARE s */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!50717 SELECT COUNT(*) INTO @rocksdb_has_p_s_session_variables FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'performance_schema' AND TABLE_NAME = 'session_variables' */;
/*!50717 SET @rocksdb_get_is_supported = IF (@rocksdb_has_p_s_session_variables, 'SELECT COUNT(*) INTO @rocksdb_is_supported FROM performance_schema.session_variables WHERE VARIABLE_NAME=\'rocksdb_bulk_load\'', 'SELECT 0') */;
/*!50717 PREPARE s FROM @rocksdb_get_is_supported */;
/*!50717 EXECUTE s */;
/*!50717 DEALLOCATE PREPARE s */;
/*!50717 SET @rocksdb_enable_bulk_load = IF (@rocksdb_is_supported, 'SET SESSION rocksdb_bulk_load = 1', 'SET @rocksdb_dummy_bulk_load = 0') */;
/*!50717 PREPARE s FROM @rocksdb_enable_bulk_load */;
/*!50717 EXECUTE s */;
/*!50717 DEALLOCATE PREPARE s */;

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
INSERT INTO `achievements` VALUES (1,'Первая кровь','Убейте 10 любых монстров','images/ui/achiev_kill.png','kill_mob',0,10,0,0,0),(2,'Копилка','Накопите 1000 золота','images/ui/achiev_gold.png','gold',0,1000,0,0,0),(3,'Помощник','Выполните 5 заданий у НПС','images/ui/achiev_quest.png','quest',0,5,0,0,0);
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `arena_cooldowns` WRITE;
/*!40000 ALTER TABLE `arena_cooldowns` DISABLE KEYS */;
INSERT INTO `arena_cooldowns` VALUES (6,27,1773754734);
/*!40000 ALTER TABLE `arena_cooldowns` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `arena_shop` WRITE;
/*!40000 ALTER TABLE `arena_shop` DISABLE KEYS */;
INSERT INTO `arena_shop` VALUES (1,1,46),(2,2,46),(3,3,11),(4,4,32),(5,5,50);
/*!40000 ALTER TABLE `arena_shop` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `auction_lots` WRITE;
/*!40000 ALTER TABLE `auction_lots` DISABLE KEYS */;
INSERT INTO `auction_lots` VALUES (1,6,2,'weapon',1,100,0,0,0,0,1773428087),(2,6,6,'material',17,170,0,0,0,0,1773428107);
/*!40000 ALTER TABLE `auction_lots` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `chat` WRITE;
/*!40000 ALTER TABLE `chat` DISABLE KEYS */;
INSERT INTO `chat` VALUES (1,1,'lol','Xhhxhd','2026-02-09 16:26:06'),(2,7,'Ововов','Алалла','2026-02-09 16:48:22'),(3,12,'Ueueueur','Аооа','2026-02-12 08:31:45'),(4,16,'Йййййй','Чааа','2026-02-12 14:16:02'),(5,6,'Лвлв','Вллвлв','2026-02-14 17:49:18'),(6,29,'Кккее','Вшвш','2026-02-14 17:57:41'),(7,0,'SYSTEM','Система: Герой Лвлв сразил Темный Рыцарь! Следующее появление через 01:00','2026-02-14 20:00:42'),(8,0,'SYSTEM','Система: Лвлв получает предмет <span style=\'color:orange; font-weight:bold;\'>Ржавый меч</span> за убийство босса!','2026-02-14 20:00:42'),(9,0,'SYSTEM','Система: Герой Лвлв сразил Темный Рыцарь! Следующее появление через 01:00','2026-02-20 19:21:43'),(10,0,'SYSTEM','Система: Лвлв получает предмет <span style=\'color:orange; font-weight:bold;\'>Ржавый меч</span> за убийство босса!','2026-02-20 19:21:43'),(11,6,'Лвлв','Аддад','2026-02-20 19:21:56'),(12,6,'Лвлв','Аааа','2026-02-21 20:17:24'),(13,0,'SYSTEM','Система: Герой Лвлв сразил Темный Рыцарь! Следующее появление через 01:00','2026-02-21 20:29:25'),(14,0,'SYSTEM','Система: Лвлв получает предмет <span style=\'color:orange; font-weight:bold;\'>Ржавый меч</span> за убийство босса!','2026-02-21 20:29:25'),(15,0,'SYSTEM','Система: Герой Лвлв сразил Темный Рыцарь! Следующее появление через 01:00','2026-02-23 19:18:51'),(16,0,'SYSTEM','Система: Лвлв получает предмет <span style=\'color:orange; font-weight:bold;\'>Ржавый меч</span> за убийство босса!','2026-02-23 19:18:51'),(17,0,'SYSTEM','Система: Герой Лвлв сразил Темный Рыцарь! Следующее появление через 01:00','2026-03-08 08:52:53'),(18,0,'SYSTEM','Система: Лвлв получает предмет <span style=\'color:orange; font-weight:bold;\'>Ржавый меч</span> за убийство босса!','2026-03-08 08:52:53');
/*!40000 ALTER TABLE `chat` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `clan_history` WRITE;
/*!40000 ALTER TABLE `clan_history` DISABLE KEYS */;
INSERT INTO `clan_history` VALUES (1,1,6,'Лвлв','create',0,'Клан создан','2026-02-14 11:12:45'),(2,1,27,'лол','join',0,'Вступил в клан','2026-02-14 11:13:27'),(3,1,6,'Лвлв','donate',10,'Взнос золота','2026-02-14 17:51:01'),(4,1,6,'Лвлв','donate',500,'Взнос золота','2026-02-14 18:36:02'),(5,1,6,'Лвлв','upgrade',0,'Клан улучшен до уровня 2','2026-02-14 18:36:07'),(6,1,33,'Ssss','join',0,'Вступил в клан','2026-02-21 19:06:26');
/*!40000 ALTER TABLE `clan_history` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `clans` WRITE;
/*!40000 ALTER TABLE `clans` DISABLE KEYS */;
INSERT INTO `clans` VALUES (1,'Админ','',6,2,410,1,'2026-02-14 11:12:45',1,1,1);
/*!40000 ALTER TABLE `clans` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `craft_materials` WRITE;
/*!40000 ALTER TABLE `craft_materials` DISABLE KEYS */;
INSERT INTO `craft_materials` VALUES (1,1,0,0),(2,1,6,1),(3,2,9,5),(4,3,13,5),(5,3,11,1);
/*!40000 ALTER TABLE `craft_materials` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `craft_recipes` WRITE;
/*!40000 ALTER TABLE `craft_recipes` DISABLE KEYS */;
INSERT INTO `craft_recipes` VALUES (1,15,10,2,'weapon'),(2,16,30,1,'body'),(3,17,150,5,'head');
/*!40000 ALTER TABLE `craft_recipes` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `daily_rewards` WRITE;
/*!40000 ALTER TABLE `daily_rewards` DISABLE KEYS */;
INSERT INTO `daily_rewards` VALUES (1,'gold',50,'coin.png'),(2,'gold',100,'coin_stack.png'),(3,'gold',200,'coin_bag.png'),(4,'gold',300,'coin_bag.png'),(5,'item',1,'helm_common.png'),(6,'gold',500,'chest_gold.png'),(7,'item',2,'sword_rusty.png');
/*!40000 ALTER TABLE `daily_rewards` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `dungeon_cooldowns` WRITE;
/*!40000 ALTER TABLE `dungeon_cooldowns` DISABLE KEYS */;
/*!40000 ALTER TABLE `dungeon_cooldowns` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `dungeon_drops` WRITE;
/*!40000 ALTER TABLE `dungeon_drops` DISABLE KEYS */;
INSERT INTO `dungeon_drops` VALUES (1,1,2,100),(2,1,17,10);
/*!40000 ALTER TABLE `dungeon_drops` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `dungeons` WRITE;
/*!40000 ALTER TABLE `dungeons` DISABLE KEYS */;
INSERT INTO `dungeons` VALUES (1,'Логово Зла','dungeon_cave.png',1,5,7,'Темный Рыцарь','boss_knight.png',500,500,20,5,2,60,0,100,300,200,500,0,0,0);
/*!40000 ALTER TABLE `dungeons` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `equipment` WRITE;
/*!40000 ALTER TABLE `equipment` DISABLE KEYS */;
INSERT INTO `equipment` VALUES (1,0,0,0,0,0,0,0),(2,0,0,0,0,0,0,0),(3,0,0,0,0,0,0,0),(4,0,0,0,0,0,0,0),(5,0,0,0,0,0,0,0),(6,0,0,0,198,0,0,290),(7,0,0,0,0,0,0,0),(8,0,0,0,0,0,0,0),(9,0,0,0,0,0,0,0),(10,0,0,0,0,0,0,0),(11,0,0,0,2,0,0,0),(12,0,0,0,2,0,0,0),(14,0,0,0,0,0,0,0),(26,0,0,0,0,0,0,0),(27,1,0,0,2,0,0,0),(28,0,0,0,0,0,0,0),(29,1,0,0,2,0,0,0),(41,1,0,0,2,0,0,0),(45,1,0,0,2,0,0,0);
/*!40000 ALTER TABLE `equipment` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `forum_categories` WRITE;
/*!40000 ALTER TABLE `forum_categories` DISABLE KEYS */;
INSERT INTO `forum_categories` VALUES (1,'Новости','',1,1773844047);
/*!40000 ALTER TABLE `forum_categories` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `forum_likes` WRITE;
/*!40000 ALTER TABLE `forum_likes` DISABLE KEYS */;
INSERT INTO `forum_likes` VALUES (2,55,'topic',2),(1,55,'message',1);
/*!40000 ALTER TABLE `forum_likes` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `forum_messages` WRITE;
/*!40000 ALTER TABLE `forum_messages` DISABLE KEYS */;
INSERT INTO `forum_messages` VALUES (1,1,6,'Тест форума',1773844061,1);
/*!40000 ALTER TABLE `forum_messages` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `forum_topics` WRITE;
/*!40000 ALTER TABLE `forum_topics` DISABLE KEYS */;
INSERT INTO `forum_topics` VALUES (1,1,6,'Тест','',1773844061,0,0),(2,1,55,'[item:18] Проверка','[item:18] вот это скин ,и ещё фон  [item:19]',1773862500,0,1);
/*!40000 ALTER TABLE `forum_topics` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `friends` WRITE;
/*!40000 ALTER TABLE `friends` DISABLE KEYS */;
INSERT INTO `friends` VALUES (1,27,6,1,'2026-02-12 23:41:44'),(2,29,27,0,'2026-02-14 17:57:48'),(3,29,6,1,'2026-02-14 17:57:55'),(4,34,6,1,'2026-02-21 20:42:14'),(6,6,49,1,'2026-03-14 08:09:38'),(7,6,55,0,'2026-03-18 20:12:52'),(8,60,6,0,'2026-03-23 20:47:33');
/*!40000 ALTER TABLE `friends` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `global_chat` WRITE;
/*!40000 ALTER TABLE `global_chat` DISABLE KEYS */;
INSERT INTO `global_chat` VALUES (1,6,'general','Djjd','','2026-03-15 13:41:12'),(2,6,'general','✌️','','2026-03-15 14:09:07'),(3,6,'trade','Тест','{\"unique_id\":279,\"quantity\":1,\"upgrade_level\":0,\"bonus_dmg\":0,\"bonus_hp\":0,\"bonus_def\":0,\"is_equipped\":0,\"id\":1,\"name\":\"Дырявый шлем\",\"description\":null,\"type\":\"head\",\"rarity\":\"common\",\"img\":\"helm_common.png\",\"damage\":0,\"defense\":1,\"hp_bonus\":0,\"price\":10}','2026-03-15 14:09:26'),(4,6,'trade','','{\"unique_id\":262,\"quantity\":1,\"upgrade_level\":0,\"bonus_dmg\":0,\"bonus_hp\":0,\"bonus_def\":0,\"is_equipped\":0,\"id\":18,\"name\":\"Костюм Ассасина\",\"description\":\"Крутой внешний вид\",\"type\":\"outfit\",\"rarity\":\"mythic\",\"img\":\"outfit_assassin.png\",\"damage\":0,\"defense\":0,\"hp_bonus\":0,\"price\":0}','2026-03-15 14:16:50'),(5,0,'general','Система: Герой <span style=\'color:gold;\'>Лвлв</span> добил Мирового Босса <span style=\'color:#ff5252; font-weight:bold;\'>Ифрит</span>!',NULL,'2026-03-19 17:53:41'),(6,0,'general','Система: Мировой Босс <span style=\'color:#ff5252; font-weight:bold;\'>Ифрит</span> появился на локации Город новичков!',NULL,'2026-03-19 18:01:16'),(7,0,'general','Система: Герой <span style=\'color:gold;\'>Лостик</span> добил Мирового Босса <span style=\'color:#ff5252; font-weight:bold;\'>Ифрит</span>!',NULL,'2026-03-23 14:30:06'),(8,0,'general','Система: Мировой Босс <span style=\'color:#ff5252; font-weight:bold;\'>Ифрит</span> появился на локации Город новичков!',NULL,'2026-03-23 18:45:08');
/*!40000 ALTER TABLE `global_chat` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (2,11,1,0,0,0,0,0,1),(3,11,2,0,0,0,0,0,1),(4,11,1,0,0,0,0,0,1),(6,12,1,0,0,0,0,0,1),(7,12,2,0,0,0,0,0,1),(8,12,1,0,0,0,0,0,1),(9,12,2,0,0,0,0,0,1),(10,12,1,0,0,0,0,0,1),(11,12,2,0,0,0,0,0,1),(12,12,1,0,0,0,0,0,1),(13,12,2,0,0,0,0,0,1),(14,14,2,0,0,0,0,0,1),(15,14,1,0,0,0,0,0,1),(16,12,2,0,0,0,0,0,1),(17,12,1,0,0,0,0,0,1),(18,12,2,0,0,0,0,0,1),(19,12,1,0,0,0,0,0,1),(20,12,2,0,0,0,0,0,1),(21,12,1,0,0,0,0,0,1),(22,12,2,0,0,0,0,0,1),(23,12,1,0,0,0,0,0,1),(33,15,2,0,0,0,0,0,1),(34,15,1,0,0,0,0,0,1),(35,17,2,0,0,0,0,0,1),(36,17,1,0,0,0,0,0,1),(37,17,2,0,0,0,0,0,1),(38,17,1,0,0,0,0,0,1),(43,27,2,1,1,0,0,1,1),(45,27,2,0,0,0,0,0,1),(46,27,1,0,0,0,0,0,1),(55,27,2,0,0,0,0,0,1),(56,27,1,0,0,0,0,0,1),(57,27,2,0,0,0,0,0,1),(58,27,1,0,0,0,0,0,1),(59,27,2,0,0,0,0,0,1),(60,27,1,0,0,0,0,0,1),(61,27,2,0,0,0,0,0,1),(62,27,1,0,0,0,0,0,1),(63,27,2,0,0,0,0,0,1),(64,27,2,0,0,0,0,0,1),(65,27,1,0,0,0,0,0,1),(66,27,2,0,0,0,0,0,1),(67,27,1,0,0,0,0,0,1),(68,27,2,0,0,0,0,0,1),(69,27,1,0,0,0,0,0,1),(72,27,2,0,0,0,0,0,1),(73,27,1,0,0,0,0,0,1),(84,29,2,1,1,0,0,1,1),(85,29,1,0,0,0,0,1,1),(86,29,2,0,0,0,0,0,1),(87,29,1,0,0,0,0,0,1),(88,29,2,0,0,0,0,0,1),(89,29,1,0,0,0,0,0,1),(90,29,2,0,0,0,0,0,1),(91,29,2,0,0,0,0,0,1),(92,29,1,0,0,0,0,0,1),(93,29,2,0,0,0,0,0,1),(94,29,1,0,0,0,0,0,1),(98,27,6,0,0,0,0,0,1),(133,31,2,0,0,0,0,0,1),(134,31,1,0,0,0,0,0,1),(137,32,2,0,0,0,0,0,1),(138,32,1,0,0,0,0,0,1),(139,32,2,0,0,0,0,0,1),(140,32,1,0,0,0,0,0,1),(160,33,2,0,0,0,0,0,1),(161,33,1,0,0,0,0,0,1),(162,33,2,0,0,0,0,0,1),(163,33,1,0,0,0,0,0,1),(164,33,2,0,0,0,0,0,1),(165,33,1,0,0,0,0,0,1),(166,33,2,0,0,0,0,0,1),(184,6,2,2,2,0,0,1,1),(187,36,2,0,0,0,0,0,1),(188,36,1,0,0,0,0,0,1),(189,36,9,0,0,0,0,0,3),(190,36,6,0,0,0,0,0,2),(191,37,2,0,0,0,0,0,1),(192,37,1,0,0,0,0,0,1),(193,38,2,0,0,0,0,0,1),(194,38,1,0,0,0,0,0,1),(195,38,9,0,0,0,0,0,2),(196,38,6,0,0,0,0,0,3),(198,6,2,4,4,0,0,1,1),(200,39,2,0,0,0,0,0,3),(201,39,1,0,0,0,0,0,3),(202,39,9,0,0,0,0,0,3),(203,39,6,0,0,0,0,0,3),(204,40,2,0,0,0,0,0,1),(205,40,1,0,0,0,0,0,1),(206,40,2,0,0,0,0,0,1),(207,40,1,0,0,0,0,0,1),(208,40,2,0,0,0,0,0,1),(209,40,1,0,0,0,0,0,1),(210,40,2,0,0,0,0,0,1),(211,40,1,0,0,0,0,0,1),(212,40,2,0,0,0,0,0,1),(213,40,1,0,0,0,0,0,1),(214,40,2,0,0,0,0,0,1),(215,40,1,0,0,0,0,0,1),(222,41,2,0,0,0,0,1,1),(223,41,1,0,0,0,0,1,1),(224,41,2,0,0,0,0,0,1),(225,41,1,0,0,0,0,0,1),(226,41,2,0,0,0,0,0,1),(227,41,1,0,0,0,0,0,1),(228,41,2,0,0,0,0,0,1),(229,41,9,0,0,0,0,0,5),(230,41,6,0,0,0,0,0,1),(231,43,2,0,0,0,0,0,1),(232,43,1,0,0,0,0,0,1),(233,44,2,0,0,0,0,0,1),(234,44,1,0,0,0,0,0,1),(235,44,2,0,0,0,0,0,1),(236,44,1,0,0,0,0,0,1),(237,44,2,0,0,0,0,0,1),(238,44,1,0,0,0,0,0,1),(239,44,2,0,0,0,0,0,1),(240,44,1,0,0,0,0,0,1),(241,44,2,0,0,0,0,0,1),(242,44,1,0,0,0,0,0,1),(243,44,2,0,0,0,0,0,1),(244,44,2,0,0,0,0,0,1),(245,45,2,0,0,0,0,1,1),(246,45,1,0,0,0,0,1,1),(247,45,2,0,0,0,0,0,1),(248,45,1,0,0,0,0,0,1),(249,45,2,0,0,0,0,0,1),(250,45,1,0,0,0,0,0,1),(251,45,2,0,0,0,0,0,1),(252,45,2,0,0,0,0,0,1),(253,45,1,0,0,0,0,0,1),(254,45,2,0,0,0,0,0,1),(255,45,1,0,0,0,0,0,1),(256,46,6,0,0,0,0,0,3),(262,6,18,0,0,0,0,0,1),(263,6,19,0,0,0,0,1,1),(264,6,18,0,0,0,0,0,1),(267,6,6,0,0,0,0,0,32),(268,6,19,0,0,0,0,0,1),(269,6,19,0,0,0,0,0,1),(270,6,9,0,0,0,0,0,9),(275,6,18,0,0,0,0,0,1),(276,6,2,0,0,0,0,0,1),(277,6,1,1,1,0,0,0,1),(278,6,2,0,0,0,0,0,1),(279,6,1,0,0,0,0,0,1),(280,6,2,0,0,0,0,0,1),(281,6,1,0,0,0,0,0,1),(282,6,2,0,0,0,0,0,1),(283,6,1,0,0,0,0,0,1),(284,6,2,0,0,0,0,0,1),(289,1,6,0,0,0,0,0,1),(290,6,20,0,0,0,0,1,1),(291,6,1,0,0,0,0,0,1),(292,55,2,0,0,0,0,0,1),(293,55,1,0,0,0,0,0,1),(294,6,2,0,0,0,0,0,1),(295,6,1,0,0,0,0,0,1),(296,6,14,0,0,0,0,0,2),(297,6,11,0,0,0,0,0,25),(298,6,13,0,0,0,0,0,12),(299,57,2,0,0,0,0,0,1),(300,57,1,0,0,0,0,0,1),(301,57,13,0,0,0,0,0,2),(302,6,10,0,0,0,0,0,4),(303,6,1,0,0,0,0,0,1),(304,6,6,0,0,0,0,0,32),(305,6,6,0,0,0,0,0,32),(306,6,6,0,0,0,0,0,15);
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (1,'Дырявый шлем',NULL,'head','common','helm_common.png',0,1,0,10),(2,'Ржавый меч',NULL,'weapon','legendary','sword_rusty.png',2,0,0,15),(3,'Кольцо силы',NULL,'ring','rare','ring_rare.png',1,0,5,50),(4,'Доспех рыцаря',NULL,'body','legendary','armor_leg.png',0,10,20,500),(5,'Амулет змеи',NULL,'amulet','mythic','amulet_mythic.png',3,2,10,300),(6,'Бревно Дуба','Крепкая древесина.','material','common','res_oak.png',0,0,0,2),(7,'Бревно Сосны','Пахнет смолой.','material','common','res_pine.png',0,0,0,2),(8,'Бревно Березы','Белая кора.','material','common','res_birch.png',0,0,0,2),(9,'Лен','Используется для ткани.','material','common','res_flax.png',0,0,0,1),(10,'Камень','Обычный булыжник.','material','common','res_stone.png',0,0,0,1),(11,'Золотая руда','Блестит!','material','rare','res_gold_ore.png',0,0,0,10),(12,'Уголь','Хорошо горит.','material','common','res_coal.png',0,0,0,3),(13,'Железная руда','Тяжелая руда.','material','common','res_iron_ore.png',0,0,0,5),(14,'Изумруд','Драгоценный камень.','material','mythic','res_emerald.png',0,0,0,20),(15,'Железный меч','Острый и надежный.','weapon','common','w_iron_sword.png',5,0,0,50),(16,'Кожаная куртка','Легкая защита.','body','common','a_leather_chest.png',0,3,10,40),(17,'Шлем Рыцаря','Для настоящих героев.','head','rare','h_knight.png',0,5,5,100),(18,'Костюм Ассасина','Крутой внешний вид','outfit','mythic','outfit_assassin.png',0,0,0,0),(19,'Огненный Фон','Эпический фон профиля','background','legendary','bg_fire.jpg',0,0,0,0),(20,'Демонические крылья','Крылья, сотканные из тьмы','wings','mythic','wings.png',15,5,50,5000);
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,'Город новичков','loc_spawn.jpg',1),(2,'Темный лес','loc_forest.jpg',1);
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `login_offers` WRITE;
/*!40000 ALTER TABLE `login_offers` DISABLE KEYS */;
INSERT INTO `login_offers` VALUES (1,'Стартовый Набор','loc_spawn1.jpg',1500,500,1,20,1,6,50,11,10),(2,'Набор Чемпиона','loc_forest.jpg',3000,1200,1,4,1,15,1,0,0);
/*!40000 ALTER TABLE `login_offers` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `mob_drops` WRITE;
/*!40000 ALTER TABLE `mob_drops` DISABLE KEYS */;
INSERT INTO `mob_drops` VALUES (1,1,2,100),(2,1,1,100);
/*!40000 ALTER TABLE `mob_drops` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `mobs` WRITE;
/*!40000 ALTER TABLE `mobs` DISABLE KEYS */;
INSERT INTO `mobs` VALUES (1,'Злая Крыса','mob_rat.png',18,12,30,30,5,0,2,5,15,10,20,10,0,1,1,20,20,0),(2,'Скелет','mob_skeleton.png',15,10,80,80,10,2,3,20,50,40,80,30,0,1,1,10,0,0);
/*!40000 ALTER TABLE `mobs` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,12,'Поздравляем! Ваш уровень повышен до 2!',1,'2026-02-12 11:03:27'),(2,6,'Поздравляем! Ваш уровень повышен до 2!',1,'2026-02-12 13:29:16'),(3,6,'лол отправил вам запрос в друзья!',1,'2026-02-12 23:41:44'),(4,27,'Лвлв принял вашу заявку в друзья!',1,'2026-02-12 23:42:00'),(5,6,'лол отправил вам сообщение!',1,'2026-02-12 23:42:18'),(6,6,'Поздравляем! Ваш уровень повышен до 3!',1,'2026-02-14 11:44:24'),(7,27,'Поздравляем! Ваш уровень повышен до 2!',1,'2026-02-14 12:23:19'),(8,27,'Уровень повышен до 3',1,'2026-02-14 17:45:00'),(9,27,'Лвлв отправил вам сообщение!',1,'2026-02-14 17:49:11'),(10,6,'Уровень повышен до 4',1,'2026-02-14 17:51:22'),(11,27,'Кккее отправил вам запрос в друзья!',1,'2026-02-14 17:57:48'),(12,6,'Кккее отправил вам запрос в друзья!',1,'2026-02-14 17:57:55'),(13,29,'Уровень повышен до 2',1,'2026-02-14 17:59:17'),(14,29,'Лвлв принял вашу заявку в друзья!',0,'2026-02-14 18:02:50'),(15,6,'Всаавч отправил вам запрос в друзья!',1,'2026-02-21 20:42:14'),(16,34,'Лвлв принял вашу заявку в друзья!',0,'2026-02-21 20:42:52'),(17,39,'Уровень повышен до 2',0,'2026-03-07 11:28:49'),(18,6,'Лвлвшв отправил вам запрос в друзья!',1,'2026-03-08 08:53:51'),(19,41,'Уровень повышен до 2',1,'2026-03-08 08:54:49'),(20,44,'Уровень повышен до 2! Получено 1 Очко Умений.',1,'2026-03-11 13:29:26'),(21,45,'Уровень повышен до 2! Получено 1 Очко Умений.',0,'2026-03-11 13:58:16'),(22,6,'Уровень повышен до 8! Получено 1 Очко Умений.',1,'2026-03-11 14:36:02'),(23,6,'🏆 Достижение разблокировано: Первая кровь',1,'2026-03-13 11:31:46'),(24,49,'Лвлв отправил вам запрос в друзья!',1,'2026-03-14 08:09:38'),(25,6,'Ffifkkd принял вашу заявку в друзья!',1,'2026-03-14 08:09:51'),(26,55,'Лвлв отправил вам запрос в друзья!',0,'2026-03-18 20:12:52'),(27,6,'Уровень повышен до 9! Получено 1 Очко Умений.',1,'2026-03-19 17:53:51'),(28,6,'🏆 Достижение разблокировано: Копилка',1,'2026-03-22 11:39:20'),(29,6,'Дчдчдчл отправил вам запрос в друзья!',1,'2026-03-23 20:47:33'),(30,6,'Лвлв отправил вам сообщение!',0,'2026-03-24 12:28:05');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `npcs` WRITE;
/*!40000 ALTER TABLE `npcs` DISABLE KEYS */;
INSERT INTO `npcs` VALUES (1,'Страж Боб','Усталый стражник, охраняющий вход.','npc_guard.png',11,11,1,'quest',0,20,0),(2,'Кузнец Вакула','Мастер своего дела. Может заточить твое снаряжение.','npc_guard1.png',12,12,1,'blacksmith',0,20,0),(3,'Гоблин-Торгаш','Заправляет местным черным рынком. Здесь можно купить всё.','goblin_auction.png',12,10,1,'auction',0,0,0);
/*!40000 ALTER TABLE `npcs` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `pets` WRITE;
/*!40000 ALTER TABLE `pets` DISABLE KEYS */;
INSERT INTO `pets` VALUES (1,'Волчонок','pet_wolf.png',5,20,1),(2,'Дракончик','pet_dragon.png',10,50,5);
/*!40000 ALTER TABLE `pets` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `premium_shop` WRITE;
/*!40000 ALTER TABLE `premium_shop` DISABLE KEYS */;
INSERT INTO `premium_shop` VALUES (1,'promo',18,500,1000,1773598478),(2,'cosmetic',20,300,0,0);
/*!40000 ALTER TABLE `premium_shop` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `private_messages` WRITE;
/*!40000 ALTER TABLE `private_messages` DISABLE KEYS */;
INSERT INTO `private_messages` VALUES (1,27,6,'Привет',1,'2026-02-12 23:42:18'),(2,6,27,'Лала',0,'2026-02-14 17:49:11'),(3,6,63,'Лвлвл',0,'2026-03-24 11:15:39'),(4,6,64,'Лалала',1,'2026-03-24 12:27:43'),(5,64,6,'Вллв',1,'2026-03-24 12:28:05'),(6,6,64,'😀',1,'2026-03-24 12:38:10');
/*!40000 ALTER TABLE `private_messages` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `quest_item_rewards` WRITE;
/*!40000 ALTER TABLE `quest_item_rewards` DISABLE KEYS */;
INSERT INTO `quest_item_rewards` VALUES (1,1,2,1);
/*!40000 ALTER TABLE `quest_item_rewards` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `quests` WRITE;
/*!40000 ALTER TABLE `quests` DISABLE KEYS */;
INSERT INTO `quests` VALUES (1,1,'Нашествие крыс','Эти твари заполонили подвал! Убей 3 крыс и я заплачу.',1,3,50,20);
/*!40000 ALTER TABLE `quests` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `storage` WRITE;
/*!40000 ALTER TABLE `storage` DISABLE KEYS */;
INSERT INTO `storage` VALUES (144,6,2,1,1774362660),(145,6,1,1,1774362660),(146,6,2,1,1774384748),(147,6,1,1,1774384748),(148,6,20,1,1774435915),(149,6,20,1,1774436532);
/*!40000 ALTER TABLE `storage` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `teleport_destinations` WRITE;
/*!40000 ALTER TABLE `teleport_destinations` DISABLE KEYS */;
INSERT INTO `teleport_destinations` VALUES (1,2),(1,3),(2,1);
/*!40000 ALTER TABLE `teleport_destinations` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `teleports` WRITE;
/*!40000 ALTER TABLE `teleports` DISABLE KEYS */;
INSERT INTO `teleports` VALUES (1,'Портал в лес','portal.png',1,10,10,2,15,15,30,-10,0),(2,'Портал в город','portal.png',2,10,10,1,10,10,0,0,0);
/*!40000 ALTER TABLE `teleports` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `tower_drops` WRITE;
/*!40000 ALTER TABLE `tower_drops` DISABLE KEYS */;
INSERT INTO `tower_drops` VALUES (1,1,1,50);
/*!40000 ALTER TABLE `tower_drops` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `tower_levels` WRITE;
/*!40000 ALTER TABLE `tower_levels` DISABLE KEYS */;
INSERT INTO `tower_levels` VALUES (1,1,'Страж Башни','mob_rat.png',50,5,10,20,'[{\"item_id\":1, \"chance\":50}, {\"item_id\":2, \"chance\":10}]'),(2,2,'Скелет-Воин','mob_wolf.png',100,10,25,50,'[{\"item_id\":1, \"chance\":30}, {\"item_id\":3, \"chance\":5}]'),(3,3,'Темный Рыцарь','mob_bear.png',250,25,100,150,'[{\"item_id\":4, \"chance\":15}]');
/*!40000 ALTER TABLE `tower_levels` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `user_achievements` WRITE;
/*!40000 ALTER TABLE `user_achievements` DISABLE KEYS */;
INSERT INTO `user_achievements` VALUES (6,1,10,1),(6,2,1000,1),(55,1,1,0),(55,2,11,0),(57,1,1,0),(57,2,15,0);
/*!40000 ALTER TABLE `user_achievements` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `user_arena_battle` WRITE;
/*!40000 ALTER TABLE `user_arena_battle` DISABLE KEYS */;
INSERT INTO `user_arena_battle` VALUES (54,38,84,100,2,0);
/*!40000 ALTER TABLE `user_arena_battle` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `user_pets` WRITE;
/*!40000 ALTER TABLE `user_pets` DISABLE KEYS */;
INSERT INTO `user_pets` VALUES (1,6,1,2,0,100),(2,6,2,5,1,0);
/*!40000 ALTER TABLE `user_pets` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `user_purchased_offers` WRITE;
/*!40000 ALTER TABLE `user_purchased_offers` DISABLE KEYS */;
INSERT INTO `user_purchased_offers` VALUES (6,1,'2026-03-24 11:02:12');
/*!40000 ALTER TABLE `user_purchased_offers` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `user_quests` WRITE;
/*!40000 ALTER TABLE `user_quests` DISABLE KEYS */;
INSERT INTO `user_quests` VALUES (1,12,1,3,2),(2,6,1,3,2),(3,15,1,0,0),(4,27,1,3,1),(5,29,1,3,2),(6,31,1,0,0),(7,33,1,3,2),(8,39,1,1,0),(9,40,1,3,1),(10,41,1,3,2),(11,44,1,3,2),(12,45,1,3,2),(13,55,1,1,0);
/*!40000 ALTER TABLE `user_quests` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `user_tower_progress` WRITE;
/*!40000 ALTER TABLE `user_tower_progress` DISABLE KEYS */;
INSERT INTO `user_tower_progress` VALUES (1,6,1,1771310254,1,0,1773650347),(2,6,2,1771310264,1,0,1774442361),(3,6,3,0,1,0,1773511657);
/*!40000 ALTER TABLE `user_tower_progress` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `user_visited_locations` WRITE;
/*!40000 ALTER TABLE `user_visited_locations` DISABLE KEYS */;
INSERT INTO `user_visited_locations` VALUES (6,1),(6,2),(57,1),(58,1),(59,1),(60,1),(61,1),(62,1),(63,1),(64,1);
/*!40000 ALTER TABLE `user_visited_locations` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'lol','$2y$12$If3WtolUyx3AwI2fUIX/EesgewglIYQdKzi4aQkovbvvCBDmoywKu','warrior',-1,-1,'2026-02-09 16:25:53',1,0,100,100,100,2,0,0,0,0,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(2,'lll','$2y$12$Ta19huSRt1b/QoymTRQ/NeU7Kl2XcEnW2NOPHSbGFdyEDb1iyYnsW','warrior',0,0,'2026-02-09 16:30:41',1,0,100,100,100,2,0,0,0,0,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(3,'jdjdj','$2y$12$Jznk7CKwxJPM.SiooMqZWuIHb3JObCYXAo2qhkwdX8w7c2OlrFQgm','warrior',-1,-1,'2026-02-09 16:31:02',1,0,100,100,100,2,0,0,0,0,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(4,'Влалла','$2y$12$hcAOn8wFBjhx2jfslPZhx.iF03OsQW6byobqVgWC0bJJ955zb3iie','warrior',9,7,'2026-02-09 16:37:24',1,0,100,100,100,2,0,0,0,0,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(5,'Влаллавв','$2y$12$7Xp2fuDR/FoLm7K8eOWUJuv.g8YuiWv0Yphd.1fd/iFfcrxEw9w/.','warrior',4,0,'2026-02-09 16:42:55',1,0,100,100,100,2,0,0,0,0,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(6,'Лостик','$2y$12$f5oKsufL12CtTko3/PgSsurp6v/jQiolmTsTknat36lshGefuF.Sq','mage',7,13,'2026-02-09 16:43:12',9,2538,2553,480,480,88,30,193751,1774355960,1774355978,1,2,1774224678,1,32,10,5,0,2,1,2,2,5,1774208311,198100,NULL,'bg_fire.jpg','admin'),(7,'Ововов','$2y$12$4PHEVDiCI5ZuEMkZTODEzeNPnbdXtgxwanv/iheHb1HdQVASynp.e','warrior',6,8,'2026-02-09 16:48:09',1,0,100,100,100,2,0,0,0,0,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(8,'Вовово','$2y$12$l7Dnkv4QwabzC11mdQc1se07c5Tqwwf2s7iV6BVMnG6a50dpMipay','warrior',10,8,'2026-02-09 16:55:34',2,50,200,110,110,3,0,0,0,0,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(9,'Вллвлв','$2y$12$kYkR3Kaqi7KpNGRqfmjQ/Ooei6svPmbuROo5KDQH.eSX23b98g796','mage',9,8,'2026-02-09 17:06:18',1,18,100,70,100,2,0,13,0,0,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(10,'Eeeee','$2y$12$vS.4VX5QDcE82Yq.gdXYvuzIDlElHOFwXBKOEJsILJdQhaveJylO6','warrior',7,13,'2026-02-09 17:09:48',1,86,100,58,100,2,0,51,1770657871,0,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(11,'Овововов','$2y$12$8/qa8jyNGJbH3i7NxVE.z.Eoexwwye4ZdwJeJugnj/n/IrU92t4AW','warrior',9,12,'2026-02-11 16:08:18',1,81,100,100,100,4,0,44,1770828878,1770829501,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(12,'Ueueueur','$2y$12$DTOETTyhBoJMTMD.oazNgeMNamVr5FuvhjVf3W02TpPeUdDq.lQEK','warrior',6,7,'2026-02-12 08:20:59',2,34,150,110,110,5,0,138,1770894739,1770894761,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(13,'Вшшушвшв','$2y$12$f8WqF/SuSQkvklbcknQgSeG6MjNa6YPvz7oKG5igyJ2IiqXSGQfly','warrior',10,10,'2026-02-12 08:50:00',1,0,100,100,100,2,0,0,0,1770886212,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(14,'Вьвьвл','$2y$12$TMvwodWUR2AAAyFsdY3Qce7ErvA0X8lozlIkZoTlcme/5M5b/fBbi','mage',8,10,'2026-02-12 08:57:57',1,20,100,100,100,2,0,8,1770886698,1770886698,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(15,'Вьвьлвл','$2y$12$cSupQgJhBsbfnW6WwFC5oOSW8fUHOTVqGmKyJSd0YeQNtTWuzSIja','warrior',7,11,'2026-02-12 13:30:22',1,16,100,100,100,2,0,61,1770903040,1770903049,1,2,1770903028,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(16,'Йййййй','$2y$12$xAYy5faa76OsOQTln/YKyueHuOUoAq2gbIU8azFk.jDp366sW2sHu','warrior',6,9,'2026-02-12 14:15:55',1,0,100,100,100,2,0,0,0,1770905798,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(17,'Чолчлчо','$2y$12$hhIfPF0yCowaVjhfkJIXZerWxfVCxMdRGzX1Ru3mgtnTXuW1AcTe6','warrior',5,8,'2026-02-12 14:19:47',1,29,100,100,100,2,0,24,1770906106,1770906281,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(18,'Лвлвлвш','$2y$12$4e75rV3pS3TFXbQEPzJHU.VVX1/hfzmYgpU4vOOusi1Hf.yahK.Rm','warrior',7,12,'2026-02-12 14:26:44',1,0,100,100,100,2,0,0,0,1770906791,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(19,'Вшвшшв','$2y$12$fzk5j5wlCE6ES4iw7yQuqebrGSYZEXiQ9EWaREvYWhOkLqacIJjhe','warrior',6,10,'2026-02-12 14:33:03',1,0,100,100,100,2,0,0,0,1770906796,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(20,'Ввваа','$2y$12$VUHSujF.muRgYkX1pYpHxuOUfdSd4RUuEAbeEwa1s07ZdF11CKPi6','warrior',7,10,'2026-02-12 14:33:30',1,0,100,100,100,2,0,0,0,1770906831,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(21,'Вшвшвшш','$2y$12$ub4nPhiCL6zvuwxhqq1x1OqJm2ypqXJn4NjNxTCeoP9KaY/n0awWW','mage',6,10,'2026-02-12 14:33:45',1,0,100,100,100,2,0,0,0,1770906828,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(22,'Члчллчл','$2y$12$JuCOqgzadOHYJ7jqoKYATuxVa2krKPlkinVBUXIG5ThuDO95.rrDS','warrior',7,10,'2026-02-12 14:40:11',1,0,100,100,100,2,0,0,0,1770907259,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(23,'Чсссссс','$2y$12$HCH8FQ/J5K5RA99piosGUe//LvKdwSTC5T2P369gH6lJmMabfCEhe','mage',7,11,'2026-02-12 14:45:53',1,0,100,100,100,2,0,0,0,1770907646,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(24,'Счвчвч','$2y$12$Kl7K2m6nYXuVfnaPZiiUMOzJIO36wL/Ko1uQhX6zfpTWfghE/XpuW','mage',10,10,'2026-02-12 14:53:09',1,0,100,100,100,2,0,0,0,1770907989,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(25,'Вшвшвш','$2y$12$BA5cZw6Vj/c.ESJU47sk.u1pS48h9XNBSrAzeGwtIfaNU1yutUWgO','warrior',7,12,'2026-02-12 22:52:17',1,0,100,100,100,2,0,0,0,1770936767,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(26,'Алалал','$2y$12$VpOnwu5j.PTG9rkrZZ264.h9hSpFEJ.G4noK9n.MstYvijMiGW05C','warrior',10,7,'2026-02-12 23:00:47',1,0,100,100,100,2,0,50,0,1770937277,1,2,1770937275,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(27,'лол','$2y$12$HKCKJ7pZlTfhBSmNzezKou3MSaDNIfybXGl2vOS6KQ0hYCmES3niG','warrior',4,7,'2026-02-12 23:06:57',3,0,225,125,125,8.5,1,159,1771091106,1771093558,1,2,1771092447,1,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(28,'Влвллв','$2y$12$jn60omOpqKHjAt08WDRoquN64e1h49t9DYgt3POR8eQoU0e0yAoby','warrior',7,11,'2026-02-12 23:20:59',1,0,100,100,100,2,0,0,0,1770938468,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(29,'Кккее','$2y$12$CxGynEq6xbmjobQ6zufNve7oA91Opll2rZJSreQk24TWwP0Rr6ec2','warrior',8,11,'2026-02-14 17:57:30',2,0,150,110,110,7,1,108,1771091943,1771091961,1,2,1771091953,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(30,'Ваааааа','$2y$12$a1qZNoK1qM8Z1vU0j2eP1uwB0nBLuVSLJKR6OnbL9WjsOpLcycSmK','warrior',4,2,'2026-02-14 19:38:35',1,0,100,100,100,2,0,0,0,1771097992,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(31,'Вллвл','$2y$12$dR4p.WFJKOV9.I/DOCIFJubEmepJkB8SLov1MFLUjXNvEiXA9Fu9q','warrior',9,1,'2026-02-17 09:55:26',1,10,100,100,100,2,0,55,1771322153,1771322321,1,2,1771322148,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(32,'Кпааа','$2y$12$CminlrM9pkoCIgsalmRbTepfDqQ0ukgRWg1Tjg3Dxb/kpiu9UQmee','warrior',11,12,'2026-02-20 19:15:36',1,31,100,72,100,2,0,23,1771614983,1771614983,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(33,'Ssss','$2y$12$92p/An9D3nviOBPo0D/u.uAQ0oqIJRyGe5U82R58SjqlJuLILNWZm','warrior',7,10,'2026-02-21 19:04:29',1,71,100,105,105,2.5,0,138,1771700766,1771700801,1,2,1771700773,1,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(34,'Всаавч','$2y$12$adAcvpzsPueiJ7SOFTcfNu8v1ff.yaH/6F6nOiP3plIVR9CNRiQXK','warrior',15,12,'2026-02-21 20:41:52',1,0,100,100,100,2,0,0,0,1771706551,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(35,'Шушушушу','$2y$12$zAze33IGKHTdwhI1pZG4TOF5m6clyO.CZCnqcchzGA4xr6Prl6vgy','warrior',13,6,'2026-02-22 07:39:51',1,72,100,10,100,2,0,49,1771746610,1771746610,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(36,'Ааааа','$2y$12$e4rLEW4x/shy6Vi.lGsVfeT.77feHMjUkMW0UFtgCxXfvfkmO6n3G','warrior',9,8,'2026-02-22 11:52:05',1,17,100,100,100,2,0,8,1771761160,1771761187,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(37,'Шашаг','$2y$12$xJHnwiEpsf0SGHWIuboSief/7eczBfpCjtkKpzEuHdFA.QIvBu7n2','mage',5,6,'2026-02-22 13:59:50',1,53,100,80,100,2,0,36,1771768835,1771768835,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(38,'Оаоаоа','$2y$12$DIwOcyAAAHOunhF6SlOEFeV31N9PUFN7OELQuMxcOPSyXSnNrHDby','warrior',24,23,'2026-02-22 14:10:23',1,19,100,100,100,2,0,11,1771769450,1771769520,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(39,'Кшшкшк','$2y$12$uwfaRGLBb0Mww8KzhJ3VeetkR5TucT1jnVWSu8rM5slXAQMaBOJXG','warrior',17,14,'2026-03-07 11:27:02',2,0,150,110,110,3,0,80,1772882925,1772882944,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(40,'Лчлчлч','$2y$12$GYkgLnR2JX2yh7S.1aAr/.fXnc4sSairRXrhIZcV6VFD97.r.QKu2','mage',16,13,'2026-03-07 11:34:22',1,89,100,100,100,2,0,106,1772888798,1772888798,1,2,1772888781,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(41,'Лвлвшв','$2y$12$Sbz3W7lxtm8LqGr3EXW7PeCEN8a2PuPwcjzS0PKkOzpJizIFNDjzu','warrior',5,5,'2026-03-08 08:53:40',2,20,150,110,110,5,1,133,1772960059,1772960435,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(42,'Крпао','$2y$12$R3HsA7i543V5uKSM.fcabONilFfWXCyBQY.GVNS.QreshM702m/Ca','warrior',17,13,'2026-03-10 08:48:39',1,0,100,100,100,2,0,0,0,1773132550,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(43,'Bcbcbc','$2y$12$TudbTew3Wvpty3wXdYZZFegyCFOOYfImKinai.Idgxbvd0kleP9d6','warrior',12,16,'2026-03-10 10:20:53',1,85,100,105,105,2.5,0,35000,1773138125,1773138185,1,1,0,1,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(44,'Кгкгкшл','$2y$12$L8WC/qE0QGjuM6XS4HBqpuKs88ZJVByDIrlsmpogtgRIpMUF8bQ9G','warrior',16,13,'2026-03-11 13:22:38',2,13,150,110,110,3,0,123,1773235799,1773235805,1,1,0,NULL,0,0,0,1,0,1,0,0,5,0,0,NULL,NULL,'player'),(45,'Euueue','$2y$12$MBQGtfjz1QXPl6PFNS2B9upiEYb6dF7UvXZB6kY.UWnY7.Rxe6kzu','warrior',17,13,'2026-03-11 13:57:03',2,13,150,12,110,5,1,151,1773237525,1773237573,1,1,0,NULL,0,0,1,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(46,'Ушшуушшу','$2y$12$zv2KtWw5sBinwNjz6mTEre7uDdjy2FMot8XWckiGxWvMD5FkI8nJK','warrior',9,8,'2026-03-13 13:39:54',1,0,100,100,100,2,0,0,0,1773409246,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(47,'Гкшушу','$2y$12$ZSebeBqls70dRUpiWlzFOu0HfPusGKv8kuQyrZEgunCDsc4MRJM6G','warrior',15,13,'2026-03-13 16:21:06',1,0,100,100,100,2,0,0,0,1773418891,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(48,'Шкшкшк','$2y$12$0sgvS7EYe4QtMvjAKFwI7eecnlKo6FL0bavZsihJO9Ols23BECap.','warrior',7,10,'2026-03-13 16:43:30',1,0,100,100,100,2,0,0,0,1773420282,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(49,'Ffifkkd','$2y$12$Q2Pi6CqFLKNHv2q5lcDvNO2o5aUQyaWdZXvWYFB8AgvlhG4JJfzGi','mage',10,12,'2026-03-14 08:08:59',1,0,100,105,105,2.5,0,0,0,1773477991,1,1,0,1,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(50,'Лвлвddd','$2y$12$h3U/kTCrn11acFrPdkoRpu3dNJxlXlOILviTCbjLtoc8STNzul7y.','warrior',10,13,'2026-03-14 13:14:50',1,0,100,100,100,2,0,0,0,1773494172,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(51,'Dfddd','$2y$12$0X7uaBv0bgSuHULltn.xpOdUJfms.jOcw5XJ5h0Re6C.15JnccEfa','mage',10,12,'2026-03-14 13:15:35',1,0,100,100,100,2,0,0,0,1773494163,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(52,'Шашкшкш','$2y$12$9mPlzSNQk9ScLsG67rCZbufmALTZZqdWT0UEterkrwWYNYA4GPUgW','warrior',10,9,'2026-03-14 13:47:57',1,0,100,100,100,2,0,0,0,1773496113,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(53,'Шуушшчшч','$2y$12$YKEAe8eio55xcKawq52So.fnd6tdFIlCrd6oHXlP0kO2dKTpTYiq2','mage',10,10,'2026-03-14 13:49:42',1,0,100,100,100,2,0,0,0,1773496191,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(54,'Ововово','$2y$12$PgbjIpdbbHCiS2.5Lgdhfegp49EgZjZak612ikzCZwVnKlzT971hi','warrior',10,10,'2026-03-14 13:58:11',1,0,100,96,100,2,0,0,1773496721,1773496721,1,1,0,NULL,0,0,0,0,0,1,0,0,4,1773496700,0,NULL,NULL,'player'),(55,'Irieue','$2y$12$TtkJ0qqafSE3FNgZB9kiI.wgM62E6BDSIuJ4ZGW9XMkw/tNWWrQW6','warrior',14,14,'2026-03-18 19:30:24',1,16,100,100,100,2,0,61,1773862536,1773862596,1,2,1773862562,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(56,'Ueuus','$2y$12$xZqKh2ZwB.rFOHCESEqvCun/Q3/ouHDLjXMcZa6xTpUxbgjioM3Za','warrior',10,10,'2026-03-19 14:26:48',1,0,100,100,100,2,0,0,1773930432,1773930436,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(57,'hfghgfh','$2y$12$bau2gEifBrVPHyLJw35hG.kUCVwk7O1AvwVB.kPqYq0be.8wIvXV6','warrior',16,13,'2026-03-23 12:24:19',1,15,100,100,100,2,0,65,1774268839,1774269004,1,2,1774268698,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(58,'Шкшкша','$2y$12$W8.ArzOCRITw0rTD7pL9b.bU1dgmzIu17lie/VuIpeofPWSlwG5xG','warrior',9,12,'2026-03-23 18:51:29',1,0,100,100,100,2,0,0,0,1774295935,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(59,'Ueueueue','$2y$12$mtKJiEc5Gj02N0dG6rKyb.q7/G8Uy4o49RiSTpO48nZAOX9AgyP8y','warrior',7,11,'2026-03-23 20:42:48',1,0,100,100,100,2,0,0,0,1774298813,1,1,0,NULL,0,0,0,0,0,1,0,0,5,1774298641,0,NULL,NULL,'player'),(60,'Дчдчдчл','$2y$12$s7UWfJAaDpuMYd4RBWJcdesvwSx/KhcCDDurLp4btgoW.PucPpFlK','mage',10,15,'2026-03-23 20:47:14',1,0,100,100,100,2,0,0,0,1774298878,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(61,'Шушугу','$2y$12$qZmGdcJwe2p7x3806nX35OOwGgkvLFqNgyDacI.xPW.XpTNHeebnS','warrior',9,17,'2026-03-23 20:50:41',1,0,100,100,100,2,0,0,0,1774299089,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(62,'Лвлвшвш','$2y$12$X3bMSipsm83PHeQZ4zZa8.U1qFDcL1nEnjyZcZfCXtb7FIFcc7zzO','warrior',10,10,'2026-03-24 10:52:38',1,0,100,100,100,2,0,0,0,1774349567,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(63,'Ьчьчьчь','$2y$12$zM5kIEy7aWnU/Sle.sf4iO3PvcAyLqKgfX7RcwmozwOPJSlPsTxMG','mage',9,10,'2026-03-24 11:14:07',1,0,100,100,100,2,0,0,0,1774351013,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player'),(64,'Лвлв','$2y$12$oJQv9JGjam3IHbMeZB3yrelns/8IcpDrUTkhw9O3X7osZv.MnIYbW','warrior',10,13,'2026-03-24 12:27:03',1,0,100,100,100,2,0,0,0,1774357198,1,1,0,NULL,0,0,0,0,0,1,0,0,5,0,0,NULL,NULL,'player');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `world_boss_drops` WRITE;
/*!40000 ALTER TABLE `world_boss_drops` DISABLE KEYS */;
INSERT INTO `world_boss_drops` VALUES (1,1,1,50);
/*!40000 ALTER TABLE `world_boss_drops` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `world_bosses` WRITE;
/*!40000 ALTER TABLE `world_bosses` DISABLE KEYS */;
INSERT INTO `world_bosses` VALUES (1,'Ифрит','boss_knight.png',20,5000,4610,30,60,10,1,8,8,300,0,0,20,0);
/*!40000 ALTER TABLE `world_bosses` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `world_resources` WRITE;
/*!40000 ALTER TABLE `world_resources` DISABLE KEYS */;
INSERT INTO `world_resources` VALUES (1,'Дуб','tree','tree_oak.png',1,5,5,30,1,3,6,1774218978),(2,'Сосна','tree','tree_pine.png',1,8,3,30,1,3,7,1771098911),(3,'Береза','tree','tree_birch.png',1,2,8,30,1,3,8,0),(4,'Лен','tree','plant_flax.png',1,6,6,15,2,5,9,1773866270),(5,'Залежи камня','rock','rock_stone.png',1,17,17,20,1,4,10,1774276280),(6,'Золотая жила','ore','ore_gold.png',1,18,18,120,1,2,11,1774276271),(7,'Уголь','rock','ore_coal.png',1,14,16,40,2,5,12,0),(8,'Железная жила','ore','ore_iron.png',1,16,14,60,1,3,13,1774276256),(9,'Изумрудная жила','ore','ore_emerald.png',1,19,19,300,1,1,14,1774276275);
/*!40000 ALTER TABLE `world_resources` ENABLE KEYS */;
UNLOCK TABLES;
/*!50112 SET @disable_bulk_load = IF (@is_rocksdb_supported, 'SET SESSION rocksdb_bulk_load = @old_rocksdb_bulk_load', 'SET @dummy_rocksdb_bulk_load = 0') */;
/*!50112 PREPARE s FROM @disable_bulk_load */;
/*!50112 EXECUTE s */;
/*!50112 DEALLOCATE PREPARE s */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!50717 SELECT COUNT(*) INTO @rocksdb_has_p_s_session_variables FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'performance_schema' AND TABLE_NAME = 'session_variables' */;
/*!50717 SET @rocksdb_get_is_supported = IF (@rocksdb_has_p_s_session_variables, 'SELECT COUNT(*) INTO @rocksdb_is_supported FROM performance_schema.session_variables WHERE VARIABLE_NAME=\'rocksdb_bulk_load\'', 'SELECT 0') */;
/*!50717 PREPARE s FROM @rocksdb_get_is_supported */;
/*!50717 EXECUTE s */;
/*!50717 DEALLOCATE PREPARE s */;
/*!50717 SET @rocksdb_enable_bulk_load = IF (@rocksdb_is_supported, 'SET SESSION rocksdb_bulk_load = 1', 'SET @rocksdb_dummy_bulk_load = 0') */;
/*!50717 PREPARE s FROM @rocksdb_enable_bulk_load */;
/*!50717 EXECUTE s */;
/*!50717 DEALLOCATE PREPARE s */;
/*!50112 SET @disable_bulk_load = IF (@is_rocksdb_supported, 'SET SESSION rocksdb_bulk_load = @old_rocksdb_bulk_load', 'SET @dummy_rocksdb_bulk_load = 0') */;
/*!50112 PREPARE s FROM @disable_bulk_load */;
/*!50112 EXECUTE s */;
/*!50112 DEALLOCATE PREPARE s */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!50717 SELECT COUNT(*) INTO @rocksdb_has_p_s_session_variables FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'performance_schema' AND TABLE_NAME = 'session_variables' */;
/*!50717 SET @rocksdb_get_is_supported = IF (@rocksdb_has_p_s_session_variables, 'SELECT COUNT(*) INTO @rocksdb_is_supported FROM performance_schema.session_variables WHERE VARIABLE_NAME=\'rocksdb_bulk_load\'', 'SELECT 0') */;
/*!50717 PREPARE s FROM @rocksdb_get_is_supported */;
/*!50717 EXECUTE s */;
/*!50717 DEALLOCATE PREPARE s */;
/*!50717 SET @rocksdb_enable_bulk_load = IF (@rocksdb_is_supported, 'SET SESSION rocksdb_bulk_load = 1', 'SET @rocksdb_dummy_bulk_load = 0') */;
/*!50717 PREPARE s FROM @rocksdb_enable_bulk_load */;
/*!50717 EXECUTE s */;
/*!50717 DEALLOCATE PREPARE s */;
/*!50112 SET @disable_bulk_load = IF (@is_rocksdb_supported, 'SET SESSION rocksdb_bulk_load = @old_rocksdb_bulk_load', 'SET @dummy_rocksdb_bulk_load = 0') */;
/*!50112 PREPARE s FROM @disable_bulk_load */;
/*!50112 EXECUTE s */;
/*!50112 DEALLOCATE PREPARE s */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

