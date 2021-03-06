from django.db import models
from django.db.models import Q
from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete
from django.contrib.auth.models import User
import json

# Antar nå at alle url'er er lange, og at vi får slått sammen alle url-variablene til en variabel.
# ignorerer for øyeblikket de som har felter som skiller seg ut fra resten


class Tema(models.Model):
    tittel = models.CharField(max_length=200)

    def __str__(self):
        return self.tittel


class Tag(models.Model):
    tittel = models.CharField(max_length=200)

    def __str__(self):
        return self.tittel


class Dataeier(models.Model):
    tittel = models.CharField(max_length=200)
    logourl = models.CharField(max_length=500, blank=True)
    url = models.CharField(max_length=500, blank=True)

    def __str__(self):
        return self.tittel


class Type(models.Model):
    tittel = models.CharField(max_length=200)

    def __str__(self):
        return self.tittel

class Kartlag(models.Model):
    tittel = models.CharField(max_length=200)
    geonorgeurl = models.CharField(max_length=500, blank=True)
    faktaark = models.CharField(max_length=500, blank=True)
    produktark = models.CharField(max_length=500, blank=True)
    dataeier = models.ForeignKey(Dataeier, on_delete=models.CASCADE)
    tema = models.ForeignKey(
        Tema, on_delete=models.SET_NULL, null=True, blank=True)
    tag = models.ManyToManyField(Tag, blank=True)
    wmsurl = models.CharField(max_length=500, blank=True)
    wmsversion = models.CharField(max_length=500, blank=True)
    projeksjon = models.CharField(max_length=500, blank=True)
    wmsinfoformat = models.CharField(max_length=500, blank=True)
    aggregatedwmslayer = models.CharField(max_length=100, blank=True)
    type = models.ForeignKey(
        Type, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.tittel

class Sublag(models.Model):
    tittel = models.CharField(max_length=200)
    wmslayer = models.CharField(max_length=100, blank=True)
    legendeurl = models.CharField(max_length=500, blank=True)
    publisertest = models.BooleanField(default=False)
    publiserprod = models.BooleanField(default=False)
    hovedkartlag = models.ForeignKey(Kartlag,on_delete=models.CASCADE, related_name="sublag")
    queryable = models.BooleanField(default=False)
    minscaledenominator = models.PositiveIntegerField(null=True, blank=True)
    maxscaledenominator = models.PositiveIntegerField(null=True, blank=True)
    suggested = models.BooleanField(default=False)
    testkoordinater = models.CharField(max_length=500, blank=True)
    klikkurl = models.CharField(max_length=500, blank=True)
    klikktekst = models.CharField(max_length=500, blank=True)
    klikktekst2 = models.CharField(max_length=500, blank=True)
    faktaark = models.CharField(max_length=500, blank=True)
    position = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return self.tittel

@receiver(post_save, sender=Kartlag)
@receiver(post_save, sender=Sublag)
@receiver(post_delete, sender=Kartlag)
@receiver(post_delete, sender=Sublag)
def createJSON(sender, instance, **kwargs):
    scaleArray = [
        559082264, # zoom 0
        279541132, # zoom 1
        139770566, # zoom 2
        69885283, # zoom 3
        34942642, # zoom 4
        17471321, # zoom 5
        8735660, # zoom 6
        4367830, # zoom 7
        2183915, # zoom 8
        1091958, # zoom 9
        545979, # zoom 10
        272989, # zoom 11
        136495, # zoom 12
        68247, # zoom 13
        34124, # zoom 14
        17062, # zoom 15
        8531, # zoom 16
        4265, # zoom 17
        2133, # zoom 18
        1066, # zoom 19
        533 # zoom 20
    ]

    dict = {}
    for kartlag in Kartlag.objects.all():
        # Check if layer contains at least one published sublayer
        number_underlag = kartlag.sublag.filter(Q(publisertest=True) | Q(publiserprod=True)).count()
        if number_underlag > 0:
            dict[kartlag.id] = {
                'id': kartlag.id,
                'dataeier': kartlag.dataeier.tittel,
                'tittel': kartlag.tittel
            }

            alle_underlag = kartlag.sublag.filter(Q(publisertest=True) | Q(publiserprod=True))
            underlag = {}
            for lag in alle_underlag:
                lag_json = {}
                if lag.tittel:
                    lag_json['tittel'] = lag.tittel
                if lag.wmslayer:
                    lag_json['wmslayer'] = lag.wmslayer
                if lag.legendeurl:
                    lag_json['legendeurl'] = lag.legendeurl
                
                lag_json['id'] = lag.id
                lag_json['queryable'] = lag.queryable
                lag_json['minscaledenominator'] = lag.minscaledenominator
                lag_json['maxscaledenominator'] = lag.maxscaledenominator
                lag_json['suggested'] = lag.suggested
                lag_json['testkoordinater'] = lag.testkoordinater
                lag_json['klikkurl'] = lag.klikkurl
                lag_json['klikktekst'] = lag.klikktekst
                lag_json['klikktekst2'] = lag.klikktekst2
                lag_json['faktaark'] = lag.faktaark
                lag_json['position'] = lag.position
                lag_json['publisertest'] = lag.publisertest
                lag_json['publiserprod'] = lag.publiserprod
                underlag[lag.id] = lag_json

                ''' ------------ CALCULATE MAX AND MIN ZOOM LEVELS ------------- '''
                # Assess if current map zoom is within sublayer's scale range
                min_number = lag.minscaledenominator if lag.minscaledenominator else 0
                max_number = lag.maxscaledenominator if lag.maxscaledenominator else 999999999

                # Some predefined values filled automatically
                if kartlag.wmsurl == 'https://geo.ngu.no/mapserver/MarinBunnsedimenterWMS?REQUEST=GetCapabilities&SERVICE=WMS':
                    max_number = 2183915
                if kartlag.wmsurl == 'https://kart.artsdatabanken.no/WMS/artskart.aspx?request=GetCapabilities&service=WMS':
                    max_number = 150000
                if (kartlag.wmsurl == 'https://gis3.nve.no/map/services/Vannkraft1/MapServer/WmsServer?request=GetCapabilities&service=WMS'
                    and lag.wmslayer == 'Magasin'):
                    max_number = 545979

                # NOTE: Some scales from NIBIO seem to be wrong.
                # Adjusted manually here (hopefully this will not
                # affect other scale denominators)
                if max_number == 1000000: max_number = 1091960
                if max_number == 500000: max_number = 545980

                minZoom = None
                maxZoom = None
                for i in range(len(scaleArray)):
                    if max_number > scaleArray[i] and minZoom is None:
                        minZoom = i

                for i in range(len(scaleArray) - 1, -1, -1):
                    if min_number < scaleArray[i] and maxZoom is None:
                        maxZoom = i

                if maxZoom is None: maxZoom = 20
                if minZoom is None: minZoom = 0

                # Minimum zoom level for loading overviews from sluggish WMSes
                minZoom = max(minZoom, 8)

                lag_json['minzoom'] = minZoom
                lag_json['maxzoom'] = maxZoom
                    
            
            dict[kartlag.id]['underlag'] = underlag

            if kartlag.dataeier.logourl:
                dict[kartlag.id]['logourl'] = kartlag.dataeier.logourl
            if kartlag.dataeier.url:
                dict[kartlag.id]['kildeurl'] = kartlag.dataeier.url
            if kartlag.type:
                dict[kartlag.id]['type'] = kartlag.type.tittel
            if kartlag.tema:
                dict[kartlag.id]['tema'] = kartlag.tema.tittel
            if kartlag.faktaark:
                dict[kartlag.id]['faktaark'] = kartlag.faktaark
            if kartlag.produktark:
                dict[kartlag.id]['produktark'] = kartlag.produktark
            if kartlag.geonorgeurl:
                dict[kartlag.id]['geonorgeurl'] = kartlag.geonorgeurl
            if kartlag.wmsurl:
                dict[kartlag.id]['wmsurl'] = kartlag.wmsurl
            if kartlag.wmsversion:
                dict[kartlag.id]['wmsversion'] = kartlag.wmsversion
            if kartlag.projeksjon:
                dict[kartlag.id]['projeksjon'] = kartlag.projeksjon
            if kartlag.wmsinfoformat:
                dict[kartlag.id]['wmsinfoformat'] = kartlag.wmsinfoformat
            if kartlag.aggregatedwmslayer:
                dict[kartlag.id]['aggregatedwmslayer'] = kartlag.aggregatedwmslayer

            if kartlag.tag:
                list = []
                for tag in kartlag.tag.all():
                    list.append(tag.tittel)
                dict[kartlag.id]['tags'] = list

    with open("../public/kartlag.json", "w", encoding='utf8') as file:
        json.dump(dict, file, indent=4, sort_keys=True, ensure_ascii=False)
