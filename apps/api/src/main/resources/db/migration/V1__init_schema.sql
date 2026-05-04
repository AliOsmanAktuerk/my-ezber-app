CREATE TABLE IF NOT EXISTS `Rolle` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Berechtigungen` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `berechtigung` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Account` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `hash` VARCHAR(255) NOT NULL,
  `rolle` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_account_hash` (`hash`),
  KEY `idx_account_rolle` (`rolle`),
  CONSTRAINT `fk_account_rolle` FOREIGN KEY (`rolle`) REFERENCES `Rolle` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Kurse` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `public` BIT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Room` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `room_owner_id` INT NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_room_owner` (`room_owner_id`),
  CONSTRAINT `fk_room_owner` FOREIGN KEY (`room_owner_id`) REFERENCES `Account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `KursItem` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `state` BIT NOT NULL,
  `kurse_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_kurs_item_kurs` (`kurse_id`),
  CONSTRAINT `fk_kurs_item_kurs` FOREIGN KEY (`kurse_id`) REFERENCES `Kurse` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `classroom` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `account_id` INT NOT NULL,
  `room_id` INT NOT NULL,
  `kurse_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_classroom_account` (`account_id`),
  KEY `idx_classroom_room` (`room_id`),
  KEY `idx_classroom_kurs` (`kurse_id`),
  CONSTRAINT `fk_classroom_account` FOREIGN KEY (`account_id`) REFERENCES `Account` (`id`),
  CONSTRAINT `fk_classroom_room` FOREIGN KEY (`room_id`) REFERENCES `Room` (`id`),
  CONSTRAINT `fk_classroom_kurs` FOREIGN KEY (`kurse_id`) REFERENCES `Kurse` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `match` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `Account_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_match_account` (`Account_id`),
  CONSTRAINT `fk_match_account` FOREIGN KEY (`Account_id`) REFERENCES `Account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Account_match` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `Account_id` INT NOT NULL,
  `match_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_account_match_account` (`Account_id`),
  KEY `idx_account_match_match` (`match_id`),
  CONSTRAINT `fk_account_match_account` FOREIGN KEY (`Account_id`) REFERENCES `Account` (`id`),
  CONSTRAINT `fk_account_match_match` FOREIGN KEY (`match_id`) REFERENCES `match` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Rolle_Berechtigungen` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `Rolle_id` INT NOT NULL,
  `Berechtigungen_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_rolle_berechtigungen_rolle` (`Rolle_id`),
  KEY `idx_rolle_berechtigungen_berechtigung` (`Berechtigungen_id`),
  CONSTRAINT `fk_rolle_berechtigungen_rolle` FOREIGN KEY (`Rolle_id`) REFERENCES `Rolle` (`id`),
  CONSTRAINT `fk_rolle_berechtigungen_berechtigung` FOREIGN KEY (`Berechtigungen_id`) REFERENCES `Berechtigungen` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `account_hash` VARCHAR(36) NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_account_hash` (`account_hash`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_roles` (
  `user_id` BIGINT NOT NULL,
  `role` ENUM('USER', 'ADMIN') NOT NULL,
  PRIMARY KEY (`user_id`, `role`),
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
