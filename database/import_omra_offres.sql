-- ============================================================
--  Import des offres Omra (Saudia + Air Algérie)
--  Structure : Départ -> plusieurs FORMULES (hôtel Mecque + hôtel Médine)
--  Chaque formule a sa propre grille tarifaire complète.
-- ============================================================

-- Compagnies aériennes
INSERT INTO omra_airlines (name) SELECT 'الخطوط السعودية' WHERE NOT EXISTS (SELECT 1 FROM omra_airlines WHERE name = 'الخطوط السعودية');
INSERT INTO omra_airlines (name) SELECT 'الخطوط الجوية الجزائرية' WHERE NOT EXISTS (SELECT 1 FROM omra_airlines WHERE name = 'الخطوط الجوية الجزائرية');

-- Hôtels à Mecque
INSERT INTO omra_hotels (name, city, is_active) SELECT 'واحة الضيافة', 'mecque', 1 WHERE NOT EXISTS (SELECT 1 FROM omra_hotels WHERE name = 'واحة الضيافة');
INSERT INTO omra_hotels (name, city, is_active) SELECT 'إشراق أجياد', 'mecque', 1 WHERE NOT EXISTS (SELECT 1 FROM omra_hotels WHERE name = 'إشراق أجياد');
INSERT INTO omra_hotels (name, city, is_active) SELECT 'الميقات أجياد', 'mecque', 1 WHERE NOT EXISTS (SELECT 1 FROM omra_hotels WHERE name = 'الميقات أجياد');
INSERT INTO omra_hotels (name, city, is_active) SELECT 'إعمار الديوان أجياد', 'mecque', 1 WHERE NOT EXISTS (SELECT 1 FROM omra_hotels WHERE name = 'إعمار الديوان أجياد');

-- Hôtel à Médine — PLACEHOLDER générique, à remplacer par le vrai hôtel dans le dashboard
INSERT INTO omra_hotels (name, city, is_active, description) SELECT 'فندق المدينة (إلى تحديد)', 'medine', 1, 'Hôtel temporaire à compléter — voir dashboard Admin > Hôtels' WHERE NOT EXISTS (SELECT 1 FROM omra_hotels WHERE name = 'فندق المدينة (إلى تحديد)');

-- ============================================================
--  Départs SAUDIA (4 dates, chacune avec 3 formules d'hébergement)
-- ============================================================
INSERT INTO omra_departures (title_ar, airline_id, departure_date, return_date, status, is_active)
SELECT 'عمرة الخطوط السعودية — 2026-06-15', (SELECT id FROM omra_airlines WHERE name='الخطوط السعودية'), '2026-06-15', '2026-06-29', 'ouvert', 1;

SET @dep_id = LAST_INSERT_ID();

INSERT INTO omra_packages (departure_id, mecque_hotel_id, mecque_nights, medine_hotel_id, medine_nights, is_active)
SELECT @dep_id,
  (SELECT id FROM omra_hotels WHERE name = 'واحة الضيافة'), 7,
  (SELECT id FROM omra_hotels WHERE name = 'فندق المدينة (إلى تحديد)'), 3, 1;

SET @pkg_id = LAST_INSERT_ID();

INSERT INTO omra_pricing (package_id, occupancy, adult_cost_dzd, adult_sale_dzd, child_with_bed_cost_dzd, child_with_bed_sale_dzd, child_no_bed_cost_dzd, child_no_bed_sale_dzd, infant_cost_dzd, infant_sale_dzd)
VALUES
  (@pkg_id, 'quintuple', 0, 199000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'quadruple', 0, 209000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'triple',    0, 239000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'double',    0, 259000, 0, 0, 0, 0, 0, 0);

INSERT INTO omra_packages (departure_id, mecque_hotel_id, mecque_nights, medine_hotel_id, medine_nights, is_active)
SELECT @dep_id,
  (SELECT id FROM omra_hotels WHERE name = 'إشراق أجياد'), 7,
  (SELECT id FROM omra_hotels WHERE name = 'فندق المدينة (إلى تحديد)'), 3, 1;

SET @pkg_id = LAST_INSERT_ID();

INSERT INTO omra_pricing (package_id, occupancy, adult_cost_dzd, adult_sale_dzd, child_with_bed_cost_dzd, child_with_bed_sale_dzd, child_no_bed_cost_dzd, child_no_bed_sale_dzd, infant_cost_dzd, infant_sale_dzd)
VALUES
  (@pkg_id, 'quintuple', 0, 229000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'quadruple', 0, 239000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'triple',    0, 259000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'double',    0, 299000, 0, 0, 0, 0, 0, 0);

INSERT INTO omra_packages (departure_id, mecque_hotel_id, mecque_nights, medine_hotel_id, medine_nights, is_active)
SELECT @dep_id,
  (SELECT id FROM omra_hotels WHERE name = 'الميقات أجياد'), 7,
  (SELECT id FROM omra_hotels WHERE name = 'فندق المدينة (إلى تحديد)'), 3, 1;

SET @pkg_id = LAST_INSERT_ID();

INSERT INTO omra_pricing (package_id, occupancy, adult_cost_dzd, adult_sale_dzd, child_with_bed_cost_dzd, child_with_bed_sale_dzd, child_no_bed_cost_dzd, child_no_bed_sale_dzd, infant_cost_dzd, infant_sale_dzd)
VALUES
  (@pkg_id, 'quintuple', 0, 249000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'quadruple', 0, 259000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'triple',    0, 279000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'double',    0, 349000, 0, 0, 0, 0, 0, 0);

INSERT INTO omra_departures (title_ar, airline_id, departure_date, return_date, status, is_active)
SELECT 'عمرة الخطوط السعودية — 2026-06-21', (SELECT id FROM omra_airlines WHERE name='الخطوط السعودية'), '2026-06-21', '2026-07-05', 'ouvert', 1;

SET @dep_id = LAST_INSERT_ID();

INSERT INTO omra_packages (departure_id, mecque_hotel_id, mecque_nights, medine_hotel_id, medine_nights, is_active)
SELECT @dep_id,
  (SELECT id FROM omra_hotels WHERE name = 'واحة الضيافة'), 7,
  (SELECT id FROM omra_hotels WHERE name = 'فندق المدينة (إلى تحديد)'), 3, 1;

SET @pkg_id = LAST_INSERT_ID();

INSERT INTO omra_pricing (package_id, occupancy, adult_cost_dzd, adult_sale_dzd, child_with_bed_cost_dzd, child_with_bed_sale_dzd, child_no_bed_cost_dzd, child_no_bed_sale_dzd, infant_cost_dzd, infant_sale_dzd)
VALUES
  (@pkg_id, 'quintuple', 0, 199000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'quadruple', 0, 209000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'triple',    0, 239000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'double',    0, 259000, 0, 0, 0, 0, 0, 0);

INSERT INTO omra_packages (departure_id, mecque_hotel_id, mecque_nights, medine_hotel_id, medine_nights, is_active)
SELECT @dep_id,
  (SELECT id FROM omra_hotels WHERE name = 'إشراق أجياد'), 7,
  (SELECT id FROM omra_hotels WHERE name = 'فندق المدينة (إلى تحديد)'), 3, 1;

SET @pkg_id = LAST_INSERT_ID();

INSERT INTO omra_pricing (package_id, occupancy, adult_cost_dzd, adult_sale_dzd, child_with_bed_cost_dzd, child_with_bed_sale_dzd, child_no_bed_cost_dzd, child_no_bed_sale_dzd, infant_cost_dzd, infant_sale_dzd)
VALUES
  (@pkg_id, 'quintuple', 0, 229000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'quadruple', 0, 239000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'triple',    0, 259000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'double',    0, 299000, 0, 0, 0, 0, 0, 0);

INSERT INTO omra_packages (departure_id, mecque_hotel_id, mecque_nights, medine_hotel_id, medine_nights, is_active)
SELECT @dep_id,
  (SELECT id FROM omra_hotels WHERE name = 'الميقات أجياد'), 7,
  (SELECT id FROM omra_hotels WHERE name = 'فندق المدينة (إلى تحديد)'), 3, 1;

SET @pkg_id = LAST_INSERT_ID();

INSERT INTO omra_pricing (package_id, occupancy, adult_cost_dzd, adult_sale_dzd, child_with_bed_cost_dzd, child_with_bed_sale_dzd, child_no_bed_cost_dzd, child_no_bed_sale_dzd, infant_cost_dzd, infant_sale_dzd)
VALUES
  (@pkg_id, 'quintuple', 0, 249000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'quadruple', 0, 259000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'triple',    0, 279000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'double',    0, 349000, 0, 0, 0, 0, 0, 0);

INSERT INTO omra_departures (title_ar, airline_id, departure_date, return_date, status, is_active)
SELECT 'عمرة الخطوط السعودية — 2026-06-30', (SELECT id FROM omra_airlines WHERE name='الخطوط السعودية'), '2026-06-30', '2026-07-14', 'ouvert', 1;

SET @dep_id = LAST_INSERT_ID();

INSERT INTO omra_packages (departure_id, mecque_hotel_id, mecque_nights, medine_hotel_id, medine_nights, is_active)
SELECT @dep_id,
  (SELECT id FROM omra_hotels WHERE name = 'واحة الضيافة'), 7,
  (SELECT id FROM omra_hotels WHERE name = 'فندق المدينة (إلى تحديد)'), 3, 1;

SET @pkg_id = LAST_INSERT_ID();

INSERT INTO omra_pricing (package_id, occupancy, adult_cost_dzd, adult_sale_dzd, child_with_bed_cost_dzd, child_with_bed_sale_dzd, child_no_bed_cost_dzd, child_no_bed_sale_dzd, infant_cost_dzd, infant_sale_dzd)
VALUES
  (@pkg_id, 'quintuple', 0, 199000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'quadruple', 0, 209000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'triple',    0, 239000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'double',    0, 259000, 0, 0, 0, 0, 0, 0);

INSERT INTO omra_packages (departure_id, mecque_hotel_id, mecque_nights, medine_hotel_id, medine_nights, is_active)
SELECT @dep_id,
  (SELECT id FROM omra_hotels WHERE name = 'إشراق أجياد'), 7,
  (SELECT id FROM omra_hotels WHERE name = 'فندق المدينة (إلى تحديد)'), 3, 1;

SET @pkg_id = LAST_INSERT_ID();

INSERT INTO omra_pricing (package_id, occupancy, adult_cost_dzd, adult_sale_dzd, child_with_bed_cost_dzd, child_with_bed_sale_dzd, child_no_bed_cost_dzd, child_no_bed_sale_dzd, infant_cost_dzd, infant_sale_dzd)
VALUES
  (@pkg_id, 'quintuple', 0, 229000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'quadruple', 0, 239000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'triple',    0, 259000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'double',    0, 299000, 0, 0, 0, 0, 0, 0);

INSERT INTO omra_packages (departure_id, mecque_hotel_id, mecque_nights, medine_hotel_id, medine_nights, is_active)
SELECT @dep_id,
  (SELECT id FROM omra_hotels WHERE name = 'الميقات أجياد'), 7,
  (SELECT id FROM omra_hotels WHERE name = 'فندق المدينة (إلى تحديد)'), 3, 1;

SET @pkg_id = LAST_INSERT_ID();

INSERT INTO omra_pricing (package_id, occupancy, adult_cost_dzd, adult_sale_dzd, child_with_bed_cost_dzd, child_with_bed_sale_dzd, child_no_bed_cost_dzd, child_no_bed_sale_dzd, infant_cost_dzd, infant_sale_dzd)
VALUES
  (@pkg_id, 'quintuple', 0, 249000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'quadruple', 0, 259000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'triple',    0, 279000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'double',    0, 349000, 0, 0, 0, 0, 0, 0);

INSERT INTO omra_departures (title_ar, airline_id, departure_date, return_date, status, is_active)
SELECT 'عمرة الخطوط السعودية — 2026-07-06', (SELECT id FROM omra_airlines WHERE name='الخطوط السعودية'), '2026-07-06', '2026-07-20', 'ouvert', 1;

SET @dep_id = LAST_INSERT_ID();

INSERT INTO omra_packages (departure_id, mecque_hotel_id, mecque_nights, medine_hotel_id, medine_nights, is_active)
SELECT @dep_id,
  (SELECT id FROM omra_hotels WHERE name = 'واحة الضيافة'), 7,
  (SELECT id FROM omra_hotels WHERE name = 'فندق المدينة (إلى تحديد)'), 3, 1;

SET @pkg_id = LAST_INSERT_ID();

INSERT INTO omra_pricing (package_id, occupancy, adult_cost_dzd, adult_sale_dzd, child_with_bed_cost_dzd, child_with_bed_sale_dzd, child_no_bed_cost_dzd, child_no_bed_sale_dzd, infant_cost_dzd, infant_sale_dzd)
VALUES
  (@pkg_id, 'quintuple', 0, 199000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'quadruple', 0, 209000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'triple',    0, 239000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'double',    0, 259000, 0, 0, 0, 0, 0, 0);

INSERT INTO omra_packages (departure_id, mecque_hotel_id, mecque_nights, medine_hotel_id, medine_nights, is_active)
SELECT @dep_id,
  (SELECT id FROM omra_hotels WHERE name = 'إشراق أجياد'), 7,
  (SELECT id FROM omra_hotels WHERE name = 'فندق المدينة (إلى تحديد)'), 3, 1;

SET @pkg_id = LAST_INSERT_ID();

INSERT INTO omra_pricing (package_id, occupancy, adult_cost_dzd, adult_sale_dzd, child_with_bed_cost_dzd, child_with_bed_sale_dzd, child_no_bed_cost_dzd, child_no_bed_sale_dzd, infant_cost_dzd, infant_sale_dzd)
VALUES
  (@pkg_id, 'quintuple', 0, 229000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'quadruple', 0, 239000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'triple',    0, 259000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'double',    0, 299000, 0, 0, 0, 0, 0, 0);

INSERT INTO omra_packages (departure_id, mecque_hotel_id, mecque_nights, medine_hotel_id, medine_nights, is_active)
SELECT @dep_id,
  (SELECT id FROM omra_hotels WHERE name = 'الميقات أجياد'), 7,
  (SELECT id FROM omra_hotels WHERE name = 'فندق المدينة (إلى تحديد)'), 3, 1;

SET @pkg_id = LAST_INSERT_ID();

INSERT INTO omra_pricing (package_id, occupancy, adult_cost_dzd, adult_sale_dzd, child_with_bed_cost_dzd, child_with_bed_sale_dzd, child_no_bed_cost_dzd, child_no_bed_sale_dzd, infant_cost_dzd, infant_sale_dzd)
VALUES
  (@pkg_id, 'quintuple', 0, 249000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'quadruple', 0, 259000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'triple',    0, 279000, 0, 0, 0, 0, 0, 0),
  (@pkg_id, 'double',    0, 349000, 0, 0, 0, 0, 0, 0);

-- ============================================================
--  Départs AIR ALGÉRIE (3 dates, formule unique chacune)
-- ============================================================
INSERT INTO omra_departures (title_ar, airline_id, departure_date, return_date, status, is_active)
SELECT 'عمرة الخطوط الجوية الجزائرية — 2026-07-13', (SELECT id FROM omra_airlines WHERE name='الخطوط الجوية الجزائرية'), '2026-07-13', '2026-07-28', 'ouvert', 1;

SET @dep_id = LAST_INSERT_ID();

INSERT INTO omra_packages (departure_id, mecque_hotel_id, mecque_nights, medine_hotel_id, medine_nights, is_active)
SELECT @dep_id,
  (SELECT id FROM omra_hotels WHERE name = 'إعمار الديوان أجياد'), 7,
  (SELECT id FROM omra_hotels WHERE name = 'فندق المدينة (إلى تحديد)'), 3, 1;

SET @pkg_id = LAST_INSERT_ID();

INSERT INTO omra_pricing (package_id, occupancy, adult_cost_dzd, adult_sale_dzd, child_with_bed_cost_dzd, child_with_bed_sale_dzd, child_no_bed_cost_dzd, child_no_bed_sale_dzd, infant_cost_dzd, infant_sale_dzd)
VALUES
  (@pkg_id, 'quintuple', 0, 205000, 0, 190000, 0, 160000, 0, 75000),
  (@pkg_id, 'quadruple', 0, 215000, 0, 200000, 0, 160000, 0, 75000),
  (@pkg_id, 'triple', 0, 230000, 0, 215000, 0, 160000, 0, 75000),
  (@pkg_id, 'double', 0, 255000, 0, 240000, 0, 160000, 0, 75000);

INSERT INTO omra_departures (title_ar, airline_id, departure_date, return_date, status, is_active)
SELECT 'عمرة الخطوط الجوية الجزائرية — 2026-07-21', (SELECT id FROM omra_airlines WHERE name='الخطوط الجوية الجزائرية'), '2026-07-21', '2026-08-05', 'ouvert', 1;

SET @dep_id = LAST_INSERT_ID();

INSERT INTO omra_packages (departure_id, mecque_hotel_id, mecque_nights, medine_hotel_id, medine_nights, is_active)
SELECT @dep_id,
  (SELECT id FROM omra_hotels WHERE name = 'إعمار الديوان أجياد'), 7,
  (SELECT id FROM omra_hotels WHERE name = 'فندق المدينة (إلى تحديد)'), 3, 1;

SET @pkg_id = LAST_INSERT_ID();

INSERT INTO omra_pricing (package_id, occupancy, adult_cost_dzd, adult_sale_dzd, child_with_bed_cost_dzd, child_with_bed_sale_dzd, child_no_bed_cost_dzd, child_no_bed_sale_dzd, infant_cost_dzd, infant_sale_dzd)
VALUES
  (@pkg_id, 'quintuple', 0, 205000, 0, 190000, 0, 160000, 0, 75000),
  (@pkg_id, 'quadruple', 0, 215000, 0, 200000, 0, 160000, 0, 75000),
  (@pkg_id, 'triple', 0, 230000, 0, 215000, 0, 160000, 0, 75000),
  (@pkg_id, 'double', 0, 255000, 0, 240000, 0, 160000, 0, 75000);

INSERT INTO omra_departures (title_ar, airline_id, departure_date, return_date, status, is_active)
SELECT 'عمرة الخطوط الجوية الجزائرية — 2026-08-03', (SELECT id FROM omra_airlines WHERE name='الخطوط الجوية الجزائرية'), '2026-08-03', '2026-08-18', 'ouvert', 1;

SET @dep_id = LAST_INSERT_ID();

INSERT INTO omra_packages (departure_id, mecque_hotel_id, mecque_nights, medine_hotel_id, medine_nights, is_active)
SELECT @dep_id,
  (SELECT id FROM omra_hotels WHERE name = 'إعمار الديوان أجياد'), 7,
  (SELECT id FROM omra_hotels WHERE name = 'فندق المدينة (إلى تحديد)'), 3, 1;

SET @pkg_id = LAST_INSERT_ID();

INSERT INTO omra_pricing (package_id, occupancy, adult_cost_dzd, adult_sale_dzd, child_with_bed_cost_dzd, child_with_bed_sale_dzd, child_no_bed_cost_dzd, child_no_bed_sale_dzd, infant_cost_dzd, infant_sale_dzd)
VALUES
  (@pkg_id, 'quintuple', 0, 205000, 0, 190000, 0, 160000, 0, 75000),
  (@pkg_id, 'quadruple', 0, 215000, 0, 200000, 0, 160000, 0, 75000),
  (@pkg_id, 'triple', 0, 230000, 0, 215000, 0, 160000, 0, 75000),
  (@pkg_id, 'double', 0, 255000, 0, 240000, 0, 160000, 0, 75000);
