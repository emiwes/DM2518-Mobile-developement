int carG = 2;
int carR = 3;
int carY = 4;
int walkR = 5;
int walkG = 6;
 
 
// the setup routine runs once when you press reset:
void setup() {
    // initialize the digital pin as an output.
    pinMode(carG, OUTPUT);
    pinMode(carR, OUTPUT);
    pinMode(carY, OUTPUT);

    pinMode(walkR, OUTPUT);
    pinMode(walkG, OUTPUT);
}
 
// the loop routine runs over and over again forever:
void loop() {
    digitalWrite(carG, LOW);
    digitalWrite(carR, HIGH);
    digitalWrite(carY, LOW);
    digitalWrite(walkG, HIGH);
    digitalWrite(walkR, LOW);
   
    delay(1000);
   
    digitalWrite(carG, LOW);
    digitalWrite(carR, LOW);
    digitalWrite(carY, HIGH);
    digitalWrite(walkG, LOW);
    digitalWrite(walkR, HIGH);
   
    delay(1000);
   
    digitalWrite(carG, HIGH);
    digitalWrite(carR, LOW);
    digitalWrite(carY, LOW);
    digitalWrite(walkG, LOW);
    digitalWrite(walkR, HIGH);
   
    delay(1000);
   
    digitalWrite(carG, LOW);
    digitalWrite(carR, LOW);
    digitalWrite(carY, HIGH);
    digitalWrite(walkG, LOW);
    digitalWrite(walkR, HIGH);
   
    // wait for a second
    delay(1000);
}