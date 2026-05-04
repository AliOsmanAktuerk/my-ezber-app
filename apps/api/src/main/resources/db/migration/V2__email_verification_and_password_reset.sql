ALTER TABLE `users`
  ADD COLUMN `email_verified` BIT NOT NULL DEFAULT b'1',
  ADD COLUMN `email_verification_token_hash` VARCHAR(64) NULL,
  ADD COLUMN `email_verification_token_expires_at` DATETIME(6) NULL,
  ADD COLUMN `password_reset_token_hash` VARCHAR(64) NULL,
  ADD COLUMN `password_reset_token_expires_at` DATETIME(6) NULL;

CREATE INDEX `idx_users_email_verification_token_hash`
  ON `users` (`email_verification_token_hash`);

CREATE INDEX `idx_users_password_reset_token_hash`
  ON `users` (`password_reset_token_hash`);
