CREATE USER 'cenfocrm_user'@'localhost' IDENTIFIED BY PASSWORD '*CA2DA475C2D16F3F6BCD49B0D36373CF25C590C1';
CREATE USER 'cenfocrm_user'@'localhost' IDENTIFIED BY '000797'; 
GRANT ALL PRIVILEGES ON `cenfocrm\_db`.* TO 'cenfocrm_user'@'localhost';


--Sirve
drop user 'cenfocrm_db'@'localhost';
flush privileges;
CREATE USER 'cenfocrm_db'@'localhost' IDENTIFIED BY '000797'; 

--Despues del comando anterior se puede agregar a la base de datos dando click en privilegio, despues poner el 
--usuario y darle click a modificar y "All privileges".