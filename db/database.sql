INSERT INTO merchant_types VALUES (1,'food');
INSERT INTO venue_types VALUES (1,1,'bakery');
INSERT INTO venue_types VALUES (2,1,'bar');
INSERT INTO venue_types VALUES (3,1,'cafe');
INSERT INTO venue_types VALUES (4,1,'coffee_shop');
INSERT INTO venue_types VALUES (5,1,'dessert_place');
INSERT INTO venue_types VALUES (6,1,'ice_cream_shop');
INSERT INTO venue_types VALUES (7,1,'restaurant');

INSERT INTO customer_reward_types VALUES (1,1,'appetizers');
INSERT INTO customer_reward_types VALUES (2,1,'bread');
INSERT INTO customer_reward_types VALUES (3,1,'breakfast');
INSERT INTO customer_reward_types VALUES (4,1,'desserts');
INSERT INTO customer_reward_types VALUES (5,1,'drinks');
INSERT INTO customer_reward_types VALUES (6,1,'entrees');
INSERT INTO customer_reward_types VALUES (7,1,'pastry');
INSERT INTO customer_reward_types VALUES (8,1,'side_dishes');
INSERT INTO customer_reward_types VALUES (9,1,'soup');
INSERT INTO customer_reward_types VALUES (10,1,'custom');

INSERT INTO customer_reward_subtypes VALUES (1,1,'appetizer',1);
INSERT INTO customer_reward_subtypes VALUES (2,1,'bread',2);
INSERT INTO customer_reward_subtypes VALUES (3,1,'breakfast',3);
INSERT INTO customer_reward_subtypes VALUES (4,1,'crepes',3);
INSERT INTO customer_reward_subtypes VALUES (5,1,'eggs',3);
INSERT INTO customer_reward_subtypes VALUES (6,1,'omelette',3);
INSERT INTO customer_reward_subtypes VALUES (7,1,'pancakes',3);
INSERT INTO customer_reward_subtypes VALUES (8,1,'toast',3);
INSERT INTO customer_reward_subtypes VALUES (9,1,'waffles',3);
INSERT INTO customer_reward_subtypes VALUES (10,1,'dessert',4);
INSERT INTO customer_reward_subtypes VALUES (11,1,'cake',4);
INSERT INTO customer_reward_subtypes VALUES (12,1,'crepes',4);
INSERT INTO customer_reward_subtypes VALUES (13,1,'waffles',4);
INSERT INTO customer_reward_subtypes VALUES (14,1,'drink',5);
INSERT INTO customer_reward_subtypes VALUES (15,1,'beer',5);
INSERT INTO customer_reward_subtypes VALUES (16,1,'coffee',5);
INSERT INTO customer_reward_subtypes VALUES (17,1,'juice',5);
INSERT INTO customer_reward_subtypes VALUES (18,1,'wine',5);
INSERT INTO customer_reward_subtypes VALUES (19,1,'entree',6);
INSERT INTO customer_reward_subtypes VALUES (20,1,'burger',6);
INSERT INTO customer_reward_subtypes VALUES (21,1,'noodles',6);
INSERT INTO customer_reward_subtypes VALUES (22,1,'pasta',6);
INSERT INTO customer_reward_subtypes VALUES (23,1,'pizza',6);
INSERT INTO customer_reward_subtypes VALUES (24,1,'rice',6);
INSERT INTO customer_reward_subtypes VALUES (25,1,'sandwich',6);
INSERT INTO customer_reward_subtypes VALUES (26,1,'seafood',6);
INSERT INTO customer_reward_subtypes VALUES (27,1,'steak',6);
INSERT INTO customer_reward_subtypes VALUES (28,1,'sushi',6);
INSERT INTO customer_reward_subtypes VALUES (29,1,'pastry',7);
INSERT INTO customer_reward_subtypes VALUES (30,1,'side_dish',8);
INSERT INTO customer_reward_subtypes VALUES (31,1,'fries',8);
INSERT INTO customer_reward_subtypes VALUES (32,1,'fruits',8);
INSERT INTO customer_reward_subtypes VALUES (33,1,'salad',8);
INSERT INTO customer_reward_subtypes VALUES (34,1,'soup',9);
INSERT INTO customer_reward_subtypes VALUES (35,1,'custom',10);
INSERT INTO customer_reward_subtypes VALUES (36,1,'gift_cert',10);
INSERT INTO customer_reward_subtypes VALUES (37,1,'tickets',10);

INSERT INTO challenge_types VALUES (1,'birthday');
INSERT INTO challenge_types VALUES (2,'menu');
INSERT INTO challenge_types VALUES (3,'photo');
INSERT INTO challenge_types VALUES (4,'referral');
INSERT INTO challenge_types VALUES (5,'custom');

INSERT INTO merchant_challenge_types VALUES (1,1);
INSERT INTO merchant_challenge_types VALUES (1,2);
INSERT INTO merchant_challenge_types VALUES (1,3);
INSERT INTO merchant_challenge_types VALUES (1,4);
INSERT INTO merchant_challenge_types VALUES (1,5);

INSERT INTO badge_types VALUES (1,1,'newbie',1);
INSERT INTO badge_types VALUES (2,1,'enthusiast',10);
INSERT INTO badge_types VALUES (3,1,'admirer',20);
INSERT INTO badge_types VALUES (4,1,'fan',30);
INSERT INTO badge_types VALUES (5,1,'follower',40);
INSERT INTO badge_types VALUES (6,1,'groupie',50);
INSERT INTO badge_types VALUES (7,1,'nut',60);
INSERT INTO badge_types VALUES (8,1,'junkie',70);
INSERT INTO badge_types VALUES (9,1,'addict',80);
INSERT INTO badge_types VALUES (10,1,'lifer',90);
INSERT INTO badge_types VALUES (11,1,'boss',100);

INSERT INTO visit_frequency_types VALUES (1,'low');
INSERT INTO visit_frequency_types VALUES (2,'kinda_regular');
INSERT INTO visit_frequency_types VALUES (3,'regular');
INSERT INTO visit_frequency_types VALUES (4,'high');

INSERT INTO badge_type_settings VALUES (0,1,1);
INSERT INTO badge_type_settings VALUES (2,1,2);
INSERT INTO badge_type_settings VALUES (4,1,3);
INSERT INTO badge_type_settings VALUES (4,1,4);
INSERT INTO badge_type_settings VALUES (8,1,5);
INSERT INTO badge_type_settings VALUES (8,1,6);
INSERT INTO badge_type_settings VALUES (10,1,7);
INSERT INTO badge_type_settings VALUES (10,1,8);
INSERT INTO badge_type_settings VALUES (12,1,9);
INSERT INTO badge_type_settings VALUES (12,1,10);
INSERT INTO badge_type_settings VALUES (14,1,11);
INSERT INTO badge_type_settings VALUES (0,2,1);
INSERT INTO badge_type_settings VALUES (5,2,2);
INSERT INTO badge_type_settings VALUES (10,2,3);
INSERT INTO badge_type_settings VALUES (10,2,4);
INSERT INTO badge_type_settings VALUES (15,2,5);
INSERT INTO badge_type_settings VALUES (15,2,6);
INSERT INTO badge_type_settings VALUES (20,2,7);
INSERT INTO badge_type_settings VALUES (20,2,8);
INSERT INTO badge_type_settings VALUES (25,2,9);
INSERT INTO badge_type_settings VALUES (25,2,10);
INSERT INTO badge_type_settings VALUES (30,2,11);
INSERT INTO badge_type_settings VALUES (0,3,1);
INSERT INTO badge_type_settings VALUES (10,3,2);
INSERT INTO badge_type_settings VALUES (20,3,3);
INSERT INTO badge_type_settings VALUES (20,3,4);
INSERT INTO badge_type_settings VALUES (30,3,5);
INSERT INTO badge_type_settings VALUES (30,3,6);
INSERT INTO badge_type_settings VALUES (40,3,7);
INSERT INTO badge_type_settings VALUES (40,3,8);
INSERT INTO badge_type_settings VALUES (50,3,9);
INSERT INTO badge_type_settings VALUES (50,3,10);
INSERT INTO badge_type_settings VALUES (60,3,11);
INSERT INTO badge_type_settings VALUES (0,4,1);
INSERT INTO badge_type_settings VALUES (20,4,2);
INSERT INTO badge_type_settings VALUES (40,4,3);
INSERT INTO badge_type_settings VALUES (40,4,4);
INSERT INTO badge_type_settings VALUES (60,4,5);
INSERT INTO badge_type_settings VALUES (60,4,6);
INSERT INTO badge_type_settings VALUES (80,4,7);
INSERT INTO badge_type_settings VALUES (80,4,8);
INSERT INTO badge_type_settings VALUES (100,4,9);
INSERT INTO badge_type_settings VALUES (100,4,10);
INSERT INTO badge_type_settings VALUES (120,4,11);

INSERT INTO badge_type_images VALUES (1,'newbie.png');
INSERT INTO badge_type_images VALUES (2,'enthusiast.png');
INSERT INTO badge_type_images VALUES (3,'admirer.png');
INSERT INTO badge_type_images VALUES (4,'fan.png');
INSERT INTO badge_type_images VALUES (5,'follower.png');
INSERT INTO badge_type_images VALUES (6,'groupie.png');
INSERT INTO badge_type_images VALUES (7,'nut.png');
INSERT INTO badge_type_images VALUES (8,'junkie.png');
INSERT INTO badge_type_images VALUES (9,'addict.png');
INSERT INTO badge_type_images VALUES (10,'lifer.png');
INSERT INTO badge_type_images VALUES (11,'boss.png');

INSERT INTO reward_model_types VALUES (1,'amount_spend');
INSERT INTO reward_model_types VALUES (2,'items_purchased');
INSERT INTO reward_model_types VALUES (3,'visits');