ALTER TABLE `kurse`
  ADD COLUMN `account_id` INT NULL AFTER `id`;

UPDATE `kurse`
SET `account_id` = (SELECT `id` FROM `account` ORDER BY `id` LIMIT 1)
WHERE `account_id` IS NULL;

ALTER TABLE `kurse`
  MODIFY COLUMN `account_id` INT NOT NULL,
  ADD KEY `idx_kurse_account` (`account_id`),
  ADD CONSTRAINT `fk_kurse_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`);
