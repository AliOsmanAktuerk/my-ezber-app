RENAME TABLE `Rolle` TO `rolle_tmp`;
RENAME TABLE `rolle_tmp` TO `rolle`;

RENAME TABLE `Berechtigungen` TO `berechtigungen_tmp`;
RENAME TABLE `berechtigungen_tmp` TO `berechtigungen`;

RENAME TABLE `Kurse` TO `kurse_tmp`;
RENAME TABLE `kurse_tmp` TO `kurse`;

RENAME TABLE `Room` TO `room_tmp`;
RENAME TABLE `room_tmp` TO `room`;

RENAME TABLE `KursItem` TO `kurs_item_tmp`;
RENAME TABLE `kurs_item_tmp` TO `kurs_item`;

RENAME TABLE `Account_match` TO `account_match_tmp`;
RENAME TABLE `account_match_tmp` TO `account_match`;

RENAME TABLE `Rolle_Berechtigungen` TO `rolle_berechtigungen_tmp`;
RENAME TABLE `rolle_berechtigungen_tmp` TO `rolle_berechtigungen`;

ALTER TABLE `match`
  RENAME COLUMN `Account_id` TO `account_id`;

ALTER TABLE `account_match`
  RENAME COLUMN `Account_id` TO `account_id`;

ALTER TABLE `rolle_berechtigungen`
  RENAME COLUMN `Rolle_id` TO `rolle_id`,
  RENAME COLUMN `Berechtigungen_id` TO `berechtigungen_id`;
