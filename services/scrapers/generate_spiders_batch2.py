"""
Spider Generator for Batch 2 Institutions
Generates 19 institution spiders + 19 programs spiders (38 total)
"""
from datetime import datetime

# Institution data for batch 2
INSTITUTIONS = [
    # Federal Universities (4)
    {
        "name": "University of Calabar",
        "short_name": "UNICAL",
        "type": "federal_university",
        "state": "Cross River",
        "city": "Calabar",
        "website": "https://unical.edu.ng",
        "spider_name": "unical",
        "priority": 3,
        "programs": [
            {"name": "Law", "degree": "undergraduate", "qualification": "LLB", "field": "Law", "duration": 5.0},
            {"name": "Biochemistry", "degree": "undergraduate", "qualification": "BSc", "field": "Science", "duration": 4.0},
            {"name": "Architecture", "degree": "undergraduate", "qualification": "BArch", "field": "Environmental Sciences", "duration": 5.0},
        ]
    },
    {
        "name": "University of Jos",
        "short_name": "UNIJOS",
        "type": "federal_university",
        "state": "Plateau",
        "city": "Jos",
        "website": "https://unijos.edu.ng",
        "spider_name": "unijos",
        "priority": 3,
        "programs": [
            {"name": "Mining Engineering", "degree": "undergraduate", "qualification": "BEng", "field": "Engineering", "duration": 5.0},
            {"name": "Pharmacy", "degree": "undergraduate", "qualification": "BPharm", "field": "Pharmacy", "duration": 5.0},
            {"name": "Political Science", "degree": "undergraduate", "qualification": "BSc", "field": "Social Sciences", "duration": 4.0},
        ]
    },
    {
        "name": "Nnamdi Azikiwe University",
        "short_name": "UNIZIK",
        "type": "federal_university",
        "state": "Anambra",
        "city": "Awka",
        "website": "https://unizik.edu.ng",
        "spider_name": "unizik",
        "priority": 3,
        "programs": [
            {"name": "Banking and Finance", "degree": "undergraduate", "qualification": "BSc", "field": "Management Sciences", "duration": 4.0},
            {"name": "Statistics", "degree": "undergraduate", "qualification": "BSc", "field": "Science", "duration": 4.0},
            {"name": "Mass Communication", "degree": "undergraduate", "qualification": "BSc", "field": "Social Sciences", "duration": 4.0},
        ]
    },
    {
        "name": "University of Uyo",
        "short_name": "UNIUYO",
        "type": "federal_university",
        "state": "Akwa Ibom",
        "city": "Uyo",
        "website": "https://uniuyo.edu.ng",
        "spider_name": "uniuyo",
        "priority": 3,
        "programs": [
            {"name": "Nursing Science", "degree": "undergraduate", "qualification": "BNSc", "field": "Medicine", "duration": 5.0},
            {"name": "Agricultural Economics", "degree": "undergraduate", "qualification": "BSc", "field": "Agriculture", "duration": 4.0},
            {"name": "Geology", "degree": "undergraduate", "qualification": "BSc", "field": "Science", "duration": 4.0},
        ]
    },
    # State Universities (2)
    {
        "name": "Ekiti State University",
        "short_name": "EKSU",
        "type": "state_university",
        "state": "Ekiti",
        "city": "Ado-Ekiti",
        "website": "https://eksu.edu.ng",
        "spider_name": "eksu",
        "priority": 4,
        "programs": [
            {"name": "Microbiology", "degree": "undergraduate", "qualification": "BSc", "field": "Science", "duration": 4.0},
            {"name": "Public Administration", "degree": "undergraduate", "qualification": "BSc", "field": "Social Sciences", "duration": 4.0},
            {"name": "Estate Management", "degree": "undergraduate", "qualification": "BSc", "field": "Environmental Sciences", "duration": 4.0},
        ]
    },
    {
        "name": "Ladoke Akintola University of Technology",
        "short_name": "LAUTECH",
        "type": "state_university",
        "state": "Oyo",
        "city": "Ogbomoso",
        "website": "https://lautech.edu.ng",
        "spider_name": "lautech",
        "priority": 4,
        "programs": [
            {"name": "Agricultural Extension and Rural Development", "degree": "undergraduate", "qualification": "BSc", "field": "Agriculture", "duration": 4.0},
            {"name": "Pure and Applied Biology", "degree": "undergraduate", "qualification": "BSc", "field": "Science", "duration": 4.0},
            {"name": "Transport Management Technology", "degree": "undergraduate", "qualification": "BTech", "field": "Management Sciences", "duration": 4.0},
        ]
    },
    # Private Universities (2)
    {
        "name": "Babcock University",
        "short_name": "BABCOCK",
        "type": "private_university",
        "state": "Ogun",
        "city": "Ilishan-Remo",
        "website": "https://babcock.edu.ng",
        "spider_name": "babcock",
        "priority": 4,
        "programs": [
            {"name": "Medicine and Surgery", "degree": "undergraduate", "qualification": "MBBS", "field": "Medicine", "duration": 6.0},
            {"name": "Software Engineering", "degree": "undergraduate", "qualification": "BSc", "field": "Science", "duration": 4.0},
            {"name": "International Relations", "degree": "undergraduate", "qualification": "BSc", "field": "Social Sciences", "duration": 4.0},
        ]
    },
    {
        "name": "Afe Babalola University",
        "short_name": "ABUAD",
        "type": "private_university",
        "state": "Ekiti",
        "city": "Ado-Ekiti",
        "website": "https://abuad.edu.ng",
        "spider_name": "abuad",
        "priority": 4,
        "programs": [
            {"name": "Petroleum and Gas Engineering", "degree": "undergraduate", "qualification": "BEng", "field": "Engineering", "duration": 5.0},
            {"name": "Cyber Security", "degree": "undergraduate", "qualification": "BSc", "field": "Science", "duration": 4.0},
            {"name": "Anatomy", "degree": "undergraduate", "qualification": "BSc", "field": "Medicine", "duration": 5.0},
        ]
    },
    # Federal Polytechnics (7)
    {
        "name": "Federal Polytechnic Nekede",
        "short_name": "FPNO",
        "type": "polytechnic",
        "state": "Imo",
        "city": "Owerri",
        "website": "https://fpno.edu.ng",
        "spider_name": "fpno",
        "priority": 5,
        "programs": [
            {"name": "Computer Science", "degree": "nd", "qualification": "ND", "field": "Science", "duration": 2.0},
            {"name": "Electrical/Electronics Engineering", "degree": "hnd", "qualification": "HND", "field": "Engineering", "duration": 2.0},
            {"name": "Business Administration and Management", "degree": "nd", "qualification": "ND", "field": "Management Sciences", "duration": 2.0},
        ]
    },
    {
        "name": "Kaduna Polytechnic",
        "short_name": "KADPOLY",
        "type": "polytechnic",
        "state": "Kaduna",
        "city": "Kaduna",
        "website": "https://kadunapolytechnic.edu.ng",
        "spider_name": "kadpoly",
        "priority": 5,
        "programs": [
            {"name": "Architectural Technology", "degree": "nd", "qualification": "ND", "field": "Environmental Sciences", "duration": 2.0},
            {"name": "Accountancy", "degree": "hnd", "qualification": "HND", "field": "Management Sciences", "duration": 2.0},
            {"name": "Mechanical Engineering", "degree": "nd", "qualification": "ND", "field": "Engineering", "duration": 2.0},
        ]
    },
    {
        "name": "Auchi Polytechnic",
        "short_name": "AUCHIPOLY",
        "type": "polytechnic",
        "state": "Edo",
        "city": "Auchi",
        "website": "https://auchipoly.edu.ng",
        "spider_name": "auchipoly",
        "priority": 5,
        "programs": [
            {"name": "Civil Engineering Technology", "degree": "nd", "qualification": "ND", "field": "Engineering", "duration": 2.0},
            {"name": "Science Laboratory Technology", "degree": "hnd", "qualification": "HND", "field": "Science", "duration": 2.0},
            {"name": "Mass Communication", "degree": "nd", "qualification": "ND", "field": "Social Sciences", "duration": 2.0},
        ]
    },
    {
        "name": "Federal Polytechnic Ado-Ekiti",
        "short_name": "FEDPOTEK",
        "type": "polytechnic",
        "state": "Ekiti",
        "city": "Ado-Ekiti",
        "website": "https://fedpolyado.edu.ng",
        "spider_name": "fedpotek",
        "priority": 5,
        "programs": [
            {"name": "Agricultural Technology", "degree": "nd", "qualification": "ND", "field": "Agriculture", "duration": 2.0},
            {"name": "Estate Management and Valuation", "degree": "hnd", "qualification": "HND", "field": "Environmental Sciences", "duration": 2.0},
            {"name": "Statistics", "degree": "nd", "qualification": "ND", "field": "Science", "duration": 2.0},
        ]
    },
    {
        "name": "Federal Polytechnic Ilaro",
        "short_name": "FEDPOLEL",
        "type": "polytechnic",
        "state": "Ogun",
        "city": "Ilaro",
        "website": "https://federalpolyilaro.edu.ng",
        "spider_name": "fedpolel",
        "priority": 5,
        "programs": [
            {"name": "Food Technology", "degree": "nd", "qualification": "ND", "field": "Science", "duration": 2.0},
            {"name": "Office Technology and Management", "degree": "hnd", "qualification": "HND", "field": "Management Sciences", "duration": 2.0},
            {"name": "Urban and Regional Planning", "degree": "nd", "qualification": "ND", "field": "Environmental Sciences", "duration": 2.0},
        ]
    },
    {
        "name": "Moshood Abiola Polytechnic",
        "short_name": "MAPOLY",
        "type": "polytechnic",
        "state": "Ogun",
        "city": "Abeokuta",
        "website": "https://mapoly.edu.ng",
        "spider_name": "mapoly",
        "priority": 5,
        "programs": [
            {"name": "Hospitality Management", "degree": "nd", "qualification": "ND", "field": "Management Sciences", "duration": 2.0},
            {"name": "Banking and Finance", "degree": "hnd", "qualification": "HND", "field": "Management Sciences", "duration": 2.0},
            {"name": "Computer Engineering", "degree": "nd", "qualification": "ND", "field": "Engineering", "duration": 2.0},
        ]
    },
    {
        "name": "Federal Polytechnic Bida",
        "short_name": "FEDPOLYBIDA",
        "type": "polytechnic",
        "state": "Niger",
        "city": "Bida",
        "website": "https://fedpolybida.edu.ng",
        "spider_name": "fedpolybida",
        "priority": 5,
        "programs": [
            {"name": "Agricultural Engineering", "degree": "nd", "qualification": "ND", "field": "Engineering", "duration": 2.0},
            {"name": "Cooperative Economics and Management", "degree": "hnd", "qualification": "HND", "field": "Management Sciences", "duration": 2.0},
            {"name": "Surveying and Geo-Informatics", "degree": "nd", "qualification": "ND", "field": "Environmental Sciences", "duration": 2.0},
        ]
    },
    # Colleges of Education (2)
    {
        "name": "Federal College of Education Zaria",
        "short_name": "FCEZARIA",
        "type": "college_of_education",
        "state": "Kaduna",
        "city": "Zaria",
        "website": "https://fcezaria.edu.ng",
        "spider_name": "fcezaria",
        "priority": 6,
        "programs": [
            {"name": "Education and Mathematics", "degree": "diploma", "qualification": "NCE", "field": "Education", "duration": 3.0},
            {"name": "Education and English Language", "degree": "diploma", "qualification": "NCE", "field": "Education", "duration": 3.0},
            {"name": "Education and Biology", "degree": "diploma", "qualification": "NCE", "field": "Education", "duration": 3.0},
        ]
    },
    {
        "name": "Federal College of Education (Technical) Akoka",
        "short_name": "FCET Akoka",
        "type": "college_of_education",
        "state": "Lagos",
        "city": "Akoka",
        "website": "https://fcetakoka.edu.ng",
        "spider_name": "fcetakoka",
        "priority": 6,
        "programs": [
            {"name": "Technical Education (Electrical/Electronics)", "degree": "diploma", "qualification": "NCE", "field": "Education", "duration": 3.0},
            {"name": "Technical Education (Mechanical)", "degree": "diploma", "qualification": "NCE", "field": "Education", "duration": 3.0},
            {"name": "Business Education", "degree": "diploma", "qualification": "NCE", "field": "Education", "duration": 3.0},
        ]
    },
    # Specialized Institutions (2)
    {
        "name": "Nigerian Defence Academy",
        "short_name": "NDA",
        "type": "specialized",
        "state": "Kaduna",
        "city": "Kaduna",
        "website": "https://nda.edu.ng",
        "spider_name": "nda",
        "priority": 6,
        "programs": [
            {"name": "Military Science and Interdisciplinary Studies", "degree": "undergraduate", "qualification": "BSc", "field": "Military Science", "duration": 5.0},
            {"name": "Aeronautical Engineering", "degree": "undergraduate", "qualification": "BEng", "field": "Engineering", "duration": 5.0},
            {"name": "Strategic Studies", "degree": "undergraduate", "qualification": "BSc", "field": "Social Sciences", "duration": 4.0},
        ]
    },
    {
        "name": "National Open University of Nigeria",
        "short_name": "NOUN",
        "type": "specialized",
        "state": "FCT",
        "city": "Abuja",
        "website": "https://noun.edu.ng",
        "spider_name": "noun",
        "priority": 6,
        "programs": [
            {"name": "Business Administration (Distance Learning)", "degree": "undergraduate", "qualification": "BSc", "field": "Management Sciences", "duration": 4.0},
            {"name": "Political Science (Distance Learning)", "degree": "undergraduate", "qualification": "BSc", "field": "Social Sciences", "duration": 4.0},
            {"name": "Educational Management (Distance Learning)", "degree": "undergraduate", "qualification": "BEd", "field": "Education", "duration": 4.0},
        ]
    },
]


SPIDER_TEMPLATE = '''"""
Spider for {name} ({short_name})
Institution Type: {type}
Location: {city}, {state}
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class {class_name}Spider(BaseSpider, InstitutionSpiderMixin):
    """Spider for {name} institution profile."""

    name = "{spider_name}_spider"
    source_type = "institution"
    priority = {priority}
    institution_name = "{name}"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {{self.institution_name}}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing {short_name} institution (sample data)")

        try:
            # Sample institution data
            institution_data = {{
                'name': '{name}',
                'short_name': '{short_name}',
                'type': '{type}',
                'state': '{state}',
                'city': '{city}',
                'website': '{website}',
                'description': '{name} is a prestigious {type} located in {city}, {state} state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': '{website}/about',
                'scrape_timestamp': datetime.now(),
            }}

            # Generate content hash
            hash_data = {{
                'name': institution_data['name'],
                'type': institution_data['type'],
                'state': institution_data['state'],
            }}
            institution_data['content_hash'] = self.generate_hash(hash_data)

            # Validate and yield
            institution = InstitutionItem(**institution_data)
            self.log_item(institution, "institution")
            yield institution.model_dump()

        except Exception as e:
            self.logger.error(f"Error extracting institution profile: {{e}}")
            return None


class {class_name}ProgramsSpider(BaseSpider):
    """Dedicated spider for {short_name} programs."""

    name = "{spider_name}_programs_spider"
    source_type = "program"
    priority = {priority}
    institution_name = "{name}"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {{self.institution_name}}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing {short_name} programs (sample data)")

        sample_programs = {programs_list}

        for program_data in sample_programs:
            try:
                hash_data = {{
                    'institution': program_data['institution_name'],
                    'name': program_data['name'],
                    'degree_type': program_data['degree_type'],
                }}
                program_data['content_hash'] = self.generate_hash(hash_data)
                program = ProgramItem(**program_data)
                self.log_item(program, "program")
                yield program.model_dump()
            except Exception as e:
                self.handle_error(e, "program")
'''


def generate_programs_list(institution):
    """Generate the programs list string for template."""
    programs = []
    for prog in institution['programs']:
        program_dict = f"""            {{
                'institution_name': '{institution['name']}',
                'name': '{prog['name']}',
                'degree_type': '{prog['degree']}',
                'qualification': '{prog['qualification']}',
                'field_of_study': '{prog['field']}',
                'specialization': '{prog['name']}',
                'duration_years': {prog['duration']},
                'duration_text': '{int(prog['duration'])} years',
                'mode': 'full_time',
                'curriculum_summary': '{prog['name']} program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': '{institution['website']}/programmes',
                'scrape_timestamp': datetime.now(),
            }}"""
        programs.append(program_dict)

    return "[\n" + ",\n".join(programs) + "\n        ]"


def generate_spider_file(institution):
    """Generate a single spider file."""
    class_name = institution['spider_name'].replace('_', '').capitalize()
    programs_list_str = generate_programs_list(institution)

    content = SPIDER_TEMPLATE.format(
        name=institution['name'],
        short_name=institution['short_name'],
        type=institution['type'],
        city=institution['city'],
        state=institution['state'],
        website=institution['website'],
        class_name=class_name,
        spider_name=institution['spider_name'],
        priority=institution['priority'],
        programs_list=programs_list_str
    )

    filename = f"spiders/{institution['spider_name']}_spider.py"
    return filename, content


if __name__ == "__main__":
    print("=" * 80)
    print("SPIDER GENERATOR - BATCH 2")
    print("=" * 80)
    print(f"\nGenerating {len(INSTITUTIONS)} institution spiders...")
    print(f"This will create {len(INSTITUTIONS) * 2} spider files (institution + programs)")
    print()

    for i, inst in enumerate(INSTITUTIONS, 1):
        filename, content = generate_spider_file(inst)

        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"[OK] [{i:2d}/19] Created {filename} ({inst['short_name']} - {inst['type']})")

    print()
    print("=" * 80)
    print(f"SUCCESS: Generated {len(INSTITUTIONS) * 2} spider files!")
    print("=" * 80)
    print("\nNext steps:")
    print("1. Update services/scrapers/config/sources.yaml")
    print("2. Run spiders to populate database")
    print("3. Verify data with check_programs.py")
