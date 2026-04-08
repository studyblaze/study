-- Seed real-looking analytics data
INSERT INTO analytics_visits (page_path, source, ip_address, country, city, region, latitude, longitude, bounced, session_duration_seconds)
VALUES 
('/', 'organic', '8.8.8.8', 'United States', 'Mountain View', 'California', 37.4223, -122.0841, false, 120),
('/', 'social', '1.1.1.1', 'Australia', 'Sydney', 'New South Wales', -33.8688, 151.2093, false, 45),
('/find-tutors', 'direct', '2.2.2.2', 'United Kingdom', 'London', 'England', 51.5074, -0.1278, false, 300),
('/apply-tutor', 'paid', '3.3.3.3', 'Germany', 'Berlin', 'Berlin', 52.5200, 13.4050, true, 10),
('/', 'referral', '4.4.4.4', 'India', 'Mumbai', 'Maharashtra', 19.0760, 72.8777, false, 240),
('/find-tutors', 'organic', '5.5.5.5', 'Japan', 'Tokyo', 'Tokyo', 35.6762, 139.6503, false, 180),
('/', 'social', '6.6.6.6', 'Brazil', 'São Paulo', 'São Paulo', -23.5505, -46.6333, false, 95);
