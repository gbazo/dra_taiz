from pydantic import BaseModel, HttpUrl
from typing import Optional, List

class FeatureItem(BaseModel):
    icon: str
    text: str

class ServiceCard(BaseModel):
    icon: str
    title: str
    description: str

class TestimonialCard(BaseModel):
    text: str
    author: str
    rating: int # 1-5 stars

class ContactInfo(BaseModel):
    icon: str
    title: str
    content: str
    link: Optional[str] = None

class HomepageSettingsBase(BaseModel):
    # Hero Section
    hero_title: str
    hero_subtitle: str
    hero_text: str
    hero_image_url: str
    hero_cta_contact_link: HttpUrl
    hero_cta_services_link: HttpUrl

    # About Section
    about_title: str
    about_subtitle: str
    about_image_url: str
    about_text_1: str
    about_text_2: str
    about_features: List[FeatureItem]

    # Services Section
    services_title: str
    services_subtitle: str
    services_cards: List[ServiceCard]

    # Testimonials Section
    testimonials_title: str
    testimonials_subtitle: str
    testimonials_cards: List[TestimonialCard]

    # CTA Section
    cta_title: str
    cta_text: str
    cta_whatsapp_link: HttpUrl
    cta_all_links: HttpUrl

    # Contact Section
    contact_title: str
    contact_subtitle: str
    contact_info_items: List[ContactInfo]
    contact_map_embed_url: HttpUrl

    # Footer
    footer_social_instagram: HttpUrl
    footer_social_facebook: HttpUrl
    footer_social_whatsapp: HttpUrl
    footer_social_all_links: HttpUrl
    footer_copyright: str
    footer_developer_text: str

class HomepageSettingsCreate(HomepageSettingsBase):
    pass

class HomepageSettingsUpdate(HomepageSettingsBase):
    pass

class HomepageSettings(HomepageSettingsBase):
    objectId: str
    createdAt: str
    updatedAt: str
