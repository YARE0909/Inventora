ALTER TABLE invoices
ADD COLUMN due_date TIMESTAMP, 
ADD COLUMN transaction_id BIGINT,
ADD FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE;