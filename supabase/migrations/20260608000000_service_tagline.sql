alter table services add column tagline text not null default '';
update services set tagline = 'Recuerdos impresos al instante' where slug = 'fotocabina';
