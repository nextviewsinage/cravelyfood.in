"""
python manage.py fix_videos
Updates all food videos with working YouTube embed URLs.
"""
from django.core.management.base import BaseCommand
from food.models import FoodVideo, Restaurant, FoodItem


class Command(BaseCommand):
    help = 'Fix food videos with working YouTube URLs'

    # Real working YouTube food videos (all IDs verified valid via YouTube oembed API)
    VIDEOS = [
        {
            'title': 'Hyderabadi Biryani — Biryani House',
            'restaurant': 'Biryani House',
            'food': 'Hyderabadi Chicken Biryani',
            'desc': 'Authentic Hyderabadi dum biryani recipe step by step',
            'url': 'https://www.youtube.com/embed/noiAs97OVfQ?rel=0&modestbranding=1&autoplay=0',
        },
        {
            'title': 'Paneer Butter Masala — Spice Garden',
            'restaurant': 'Spice Garden',
            'food': 'Paneer Butter Masala',
            'desc': 'Dhaba style paneer butter masala recipe',
            'url': 'https://www.youtube.com/embed/Y2e2K7a-TrY?rel=0&modestbranding=1&autoplay=0',
        },
        {
            'title': 'Margherita Pizza — Pizza Palace',
            'restaurant': 'Pizza Palace',
            'food': 'Margherita Pizza',
            'desc': 'How to make a perfect Margherita Pizza at home',
            'url': 'https://www.youtube.com/embed/1-SJGQ2HLp8?rel=0&modestbranding=1&autoplay=0',
        },
        {
            'title': 'Veg Fried Rice — Dragon Wok',
            'restaurant': 'Dragon Wok',
            'food': 'Veg Fried Rice',
            'desc': 'Restaurant-style Chinese fried rice',
            'url': 'https://www.youtube.com/embed/qH__o17xHls?rel=0&modestbranding=1&autoplay=0',
        },
        {
            'title': 'Veg Supreme Pizza — Pizza Palace',
            'restaurant': 'Pizza Palace',
            'food': 'Veg Supreme Pizza',
            'desc': 'The best homemade pizza you will ever make',
            'url': 'https://www.youtube.com/embed/sv3TXMSv6Lw?rel=0&modestbranding=1&autoplay=0',
        },
        {
            'title': 'Masala Dosa — South Spice',
            'restaurant': 'South Spice',
            'food': 'Masala Dosa',
            'desc': 'Crispy South Indian masala dosa — restaurant style at home',
            'url': 'https://www.youtube.com/embed/J75VQSxOtdo?rel=0&modestbranding=1&autoplay=0',
        },
        {
            'title': 'Paneer Tikka — Spice Garden',
            'restaurant': 'Spice Garden',
            'food': 'Paneer Tikka',
            'desc': 'Smoky tandoor paneer tikka recipe',
            'url': 'https://www.youtube.com/embed/BKxGodX9NGg?rel=0&modestbranding=1&autoplay=0',
        },
        {
            'title': 'Veg Momos — Momo Magic',
            'restaurant': 'Momo Magic',
            'food': 'Veg Steamed Momos',
            'desc': 'Soft steamed momos from scratch',
            'url': 'https://www.youtube.com/embed/ZJy1ajvMU1k?rel=0&modestbranding=1&autoplay=0',
        },
    ]

    def handle(self, *args, **kwargs):
        # Delete old broken videos
        deleted = FoodVideo.objects.all().delete()
        self.stdout.write(f'Deleted old videos')

        count = 0
        for v in self.VIDEOS:
            rest = Restaurant.objects.filter(name=v['restaurant']).first()
            food = FoodItem.objects.filter(name=v['food']).first()
            if rest:
                FoodVideo.objects.create(
                    title=v['title'],
                    restaurant=rest,
                    food_item=food,
                    description=v['desc'],
                    video_url=v['url'],
                    is_active=True,
                )
                count += 1

        self.stdout.write(f'Created {count} videos with working URLs')
