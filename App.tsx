import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Image } from 'react-native';
import { Card, Button, TextInput, Text, FAB, Dialog, Portal, Provider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import * as Font from 'expo-font';
import {API_KEY} from "@env"



const fetchFonts = () => {
  return Font.loadAsync({
    'Karla-Regular': require('./assets/fonts/Karla-Regular.ttf'),
    'Karla-Bold': require('./assets/fonts/Karla-Bold.ttf'),
    'Merriweather-Regular': require('./assets/fonts/Merriweather-Regular.ttf'),
    'Merriweather-Bold': require('./assets/fonts/Merriweather-Bold.ttf'),
  });
};

const WeatherApp: React.FC = () => {

  fetchFonts();

  // dialogi setterit
  const [auki, setAuki] = useState<boolean>(false)
  const [lataa, setLataa] = useState<boolean>(false)

  //OpenWeatherApp setteri
  const [OpenWeather, setOpenWeather] = useState<any>(null);
  const [OpenIconUri, setOpenIconUri] = useState<string>("")

  //yr.no setterit
  const [temperature, setTemperature] = useState<number | null>(null);
  const [windSpeed, setWindSpeed] = useState<number | null>(null);
  const [windSpeedGust, setWindSpeedGust] = useState<number | null>(null);
  const [windDirection, setWindDirection] = useState<number | null>(null);
  const [weatherSymbol, setWeatherSymbol] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [text, setText] = useState<string>("")
  const kaupunki = "Helsinki"

  const fetchPositionalWeather = async () => {
    setLataa(true)
    let location = await Location.getCurrentPositionAsync({});
    let {latitude, longitude} = location.coords;

    try {
    const response_saa = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );
    if (!response_saa.ok) {
      throw new Error('Sään haku epäonnistui');
    }
    const data = await response_saa.json();
    setOpenWeather(data);
    setOpenIconUri(`http://openweathermap.org/img/w/${data.weather[0].icon}.png`)

    //yr.no API
    const response_yrno = await fetch(`https://api.met.no/weatherapi/nowcast/2.0/complete?lat=${latitude}&lon=${longitude}`)
    const data3 = await response_yrno.json()
    const firstForecast = data3.properties.timeseries[0]
    setTemperature(firstForecast.data.instant.details.air_temperature);
    setWindSpeed(firstForecast.data.instant.details.wind_speed);
    setWindSpeedGust(firstForecast.data.instant.details.wind_speed_of_gust);
    setWindDirection(firstForecast.data.instant.details.wind_from_direction + 180);
    setWeatherSymbol(firstForecast.data.next_1_hours.summary.symbol_code);

    const date = new Date(data3.properties.timeseries[0].time)
    const aika = date.toLocaleString()
    setTime(aika)
    setText("")
  
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLataa(false);
    }
  }

  const fetchWeather = async () => {

    setAuki(false)

    //Openweathermapin API
    try {
      const response_city = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${text ? text : kaupunki}&limit=1&appid=${API_KEY}`);
      if (!response_city.ok) {
        throw new Error('Sään haku epäonnistui');
      }
      const data2 = await response_city.json()
      if (data2.length === 0){
        throw new Error("Kaupunkia ei löydy")
      }
      const response_saa = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${data2[0].lat}&lon=${data2[0].lon}&appid=${API_KEY}&units=metric`
      );
      if (!response_saa.ok) {
        throw new Error('Sään haku epäonnistui');
      }
      const data = await response_saa.json();
      setOpenWeather(data);
      setOpenIconUri(`http://openweathermap.org/img/w/${data.weather[0].icon}.png`)

      //yr.no API
      const response_yrno = await fetch(`https://api.met.no/weatherapi/nowcast/2.0/complete?lat=${data2[0].lat}&lon=${data2[0].lon}`)
      const data3 = await response_yrno.json()
      const firstForecast = data3.properties.timeseries[0]
      setTemperature(firstForecast.data.instant.details.air_temperature);
      setWindSpeed(firstForecast.data.instant.details.wind_speed);
      setWindSpeedGust(firstForecast.data.instant.details.wind_speed_of_gust);
      setWindDirection(firstForecast.data.instant.details.wind_from_direction + 180);
      setWeatherSymbol(firstForecast.data.next_1_hours.summary.symbol_code);

      const date = new Date(data3.properties.timeseries[0].time)
      const aika = date.toLocaleString()
      setTime(aika)

      setText("")

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }
    })();
      fetchWeather();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
  <>
  {lataa ? (
      <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        <ActivityIndicator animating={true} size="large" />
        <Text>Sijaintia haetaan...</Text>
      </View>
  ) : (
    <Provider>
      <SafeAreaProvider>
        <LinearGradient
          style={{flex: 1}}
          colors={['#faf0be', '#87CEEB']} // Auringonkeltainen -> vaaleansininen
          start={{ x: 0, y: 0 }} // Alkaa ylhäältä (auringonkeltainen)
          end={{ x: 0, y: 1 }}   // Päättyy alhaalta (sininen)
          >
        <View style={{ padding: 10, paddingTop: 50, }}>
          <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 25, marginBottom: 10}}>
            <Text style={{textAlign: "center", fontSize: 30, fontFamily: "Karla-Bold"}}>Pohjoismaiden sää</Text>
            <View style={{flexDirection: "row", gap: 10}}>
              <FAB size="medium" onPress={() => fetchPositionalWeather()} style={{ backgroundColor: "white"}} icon="map-marker"></FAB>
              <FAB size="medium" onPress={() => setAuki(true)} style={{ backgroundColor: "white"}} icon="magnify"></FAB>
            </View>
          </View>
        
          <Text style={{color: "red"}}>{error}</Text>
        
          
            <Text style={{textAlign: "center", fontSize: 25, margin: 10, fontFamily: "Karla-Bold"}}>{OpenWeather.name}</Text>
            <Text style={{textAlign: "center", fontSize: 20, margin: 10, fontFamily: "Karla-Bold"}}>Päivä: {time?.split(", ")[0]} Kello: {time?.split(", ")[1].split(".")[0]}:{time?.split(", ")[1].split(".")[1]}</Text>

            <View style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
              <Image style={{width: 100, height: 100}} source={{uri: OpenIconUri}}/>
            </View>

            <View style={{paddingRight: 10, display: "flex", flexDirection: "row", gap: 10, marginTop: 10, marginBottom: 20}}>
              <View style={{width: "50%"}}>
                <Card>
                  <Text style={{margin: 13, fontSize: 20, fontFamily: "Karla-Regular"}}>OpenWeatherMap</Text>
                  <Card.Content>
                    <Text style={{fontFamily: "Karla-Regular", fontSize: 14, marginBottom: 10}}>Lämpötila: {OpenWeather?.main.temp}°C</Text>
                    <Text style={{fontFamily: "Karla-Regular", fontSize: 14, marginBottom: 10}}>Sää: {OpenWeather?.weather[0].description}</Text>
                    <Text style={{fontFamily: "Karla-Regular", fontSize: 14, marginBottom: 10}}>Tuulen nopeus: {OpenWeather?.wind.speed} m/s</Text>
                    <Text style={{fontFamily: "Karla-Regular", fontSize: 14, marginBottom: 10}}>Puuskissa: {OpenWeather?.wind.gust} m/s</Text>
                    <Text style={{fontFamily: "Karla-Regular", fontSize: 14, marginBottom: 10}}>Tuulen suunta:</Text>
                    <View style={{alignItems: "center"}}>
                      <MaterialCommunityIcons
                        name="arrow-up"
                        size={30}
                        style={{ transform: [{ rotate: `${OpenWeather?.wind.deg + 180}deg` }] }}
                        color="black"
                      />
                    </View>
                  </Card.Content>
                </Card>
              </View>

              <View style={{width: "50%"}}>
                <Card>
                  <Text style={{margin: 13, fontSize: 20, fontFamily: "Karla-Regular"}}>Yr.No</Text>
                  <Card.Content>
                    <Text style={{fontFamily: "Karla-Regular", fontSize: 14, marginBottom: 10}}>Lämpötila: {temperature}°C</Text>
                    <Text style={{fontFamily: "Karla-Regular", fontSize: 14, marginBottom: 10}}>Sää: {weatherSymbol}</Text>
                    <Text style={{fontFamily: "Karla-Regular", fontSize: 14, marginBottom: 10}}>Tuulen nopeus: {windSpeed} m/s</Text>
                    <Text style={{fontFamily: "Karla-Regular", fontSize: 14, marginBottom: 10}}>Puuskissa: {windSpeedGust} m/s</Text>
                    <Text style={{fontFamily: "Karla-Regular", fontSize: 14, marginBottom: 10}}>Tuulen suunta:</Text>
                    <View style={{alignItems: "center"}}>
                      <MaterialCommunityIcons
                        name="arrow-up"
                        size={30}
                        style={{ transform: [{ rotate: `${windDirection}deg` }] }}
                        color="black"
                      />
                    </View>
                  </Card.Content>
                </Card>
              </View>
            </View>
            
            <Portal>
              <Dialog
                visible={auki}
                onDismiss={() => setAuki(false)}
              >
                <Dialog.Title style={{textAlign: "center"}}>Vaihda kaupunkia</Dialog.Title>
                <Dialog.Content>
                <TextInput value={text} onChangeText={(uusiTeksti : string) => setText(uusiTeksti)} style={{marginBottom: 10}} label="Kaupunki"/>
                </Dialog.Content>
                <Dialog.Actions style={{justifyContent: "center"}}>
                  <Button onPress={() => fetchWeather()} style={{marginTop: 5, marginBottom: 10, padding: 5, width: "80%"}} mode='contained'>Vaihda kaupunkia</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>

            <Portal>
              <Dialog
                visible={lataa}
                onDismiss={() => setLataa(false)}
              >
                <Dialog.Title style={{textAlign: "center"}}>Vaihda kaupunkia</Dialog.Title>
                <Dialog.Content>
                <TextInput value={text} onChangeText={(uusiTeksti : string) => setText(uusiTeksti)} style={{marginBottom: 10}} label="Kaupunki"/>
                </Dialog.Content>
                <Dialog.Actions style={{justifyContent: "center"}}>
                  <Button onPress={() => fetchWeather()} style={{marginTop: 5, marginBottom: 10, padding: 5, width: "80%"}} mode='contained'>Vaihda kaupunkia</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
        </View>
        </LinearGradient>
        </SafeAreaProvider>
      </Provider>
      )}
      </>
  );
};

export default WeatherApp;