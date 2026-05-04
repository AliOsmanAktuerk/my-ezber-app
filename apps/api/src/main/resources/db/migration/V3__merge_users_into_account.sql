INSERT INTO `Rolle` (`name`)
SELECT 'USER'
WHERE NOT EXISTS (SELECT 1 FROM `Rolle` WHERE LOWER(`name`) = 'user');

INSERT INTO `Rolle` (`name`)
SELECT 'ADMIN'
WHERE EXISTS (SELECT 1 FROM `user_roles` WHERE `role` = 'ADMIN')
  AND NOT EXISTS (SELECT 1 FROM `Rolle` WHERE LOWER(`name`) = 'admin');

ALTER TABLE `Account`
  ADD COLUMN `name` VARCHAR(255) NULL AFTER `id`,
  ADD COLUMN `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  ADD COLUMN `email_verified` BIT NOT NULL DEFAULT b'1',
  ADD COLUMN `email_verification_token_hash` VARCHAR(64) NULL,
  ADD COLUMN `email_verification_token_expires_at` DATETIME(6) NULL,
  ADD COLUMN `password_reset_token_hash` VARCHAR(64) NULL,
  ADD COLUMN `password_reset_token_expires_at` DATETIME(6) NULL;

INSERT INTO `Account` (
  `name`,
  `email`,
  `password`,
  `hash`,
  `rolle`,
  `created_at`,
  `email_verified`,
  `email_verification_token_hash`,
  `email_verification_token_expires_at`,
  `password_reset_token_hash`,
  `password_reset_token_expires_at`
)
SELECT
  u.`name`,
  u.`email`,
  u.`password`,
  COALESCE(u.`account_hash`, UUID()),
  CASE
    WHEN EXISTS (
      SELECT 1 FROM `user_roles` ur
      WHERE ur.`user_id` = u.`id` AND ur.`role` = 'ADMIN'
    ) THEN (SELECT r.`id` FROM `Rolle` r WHERE LOWER(r.`name`) = 'admin' LIMIT 1)
    ELSE (SELECT r.`id` FROM `Rolle` r WHERE LOWER(r.`name`) = 'user' LIMIT 1)
  END,
  u.`created_at`,
  u.`email_verified`,
  u.`email_verification_token_hash`,
  u.`email_verification_token_expires_at`,
  u.`password_reset_token_hash`,
  u.`password_reset_token_expires_at`
FROM `users` u
WHERE NOT EXISTS (
  SELECT 1 FROM `Account` a WHERE LOWER(a.`email`) = LOWER(u.`email`)
);

UPDATE `Account`
SET `name` = SUBSTRING_INDEX(`email`, '@', 1)
WHERE `name` IS NULL OR TRIM(`name`) = '';

ALTER TABLE `Account`
  MODIFY COLUMN `name` VARCHAR(255) NOT NULL,
  ADD UNIQUE KEY `uk_account_email` (`email`);

CREATE INDEX `idx_account_email_verification_token_hash`
  ON `Account` (`email_verification_token_hash`);

CREATE INDEX `idx_account_password_reset_token_hash`
  ON `Account` (`password_reset_token_hash`);

DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `users`;
