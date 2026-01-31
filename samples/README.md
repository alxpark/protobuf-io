# Sample Files

This directory contains sample files for testing the Protobuf Encoder/Decoder web app.

## Proto Schema Files

- **user.proto** - Simple user profile with basic fields
- **product.proto** - E-commerce product catalog with nested messages and enums
- **sensor.proto** - IoT sensor readings with location data

## JSON Sample Data

### User Schema
- **user.json** - Single user profile

### Product Schema  
- **product.json** - Single product with reviews
- **product-catalog.json** - Multiple products (use with ProductCatalog message)

### Sensor Schema
- **sensor-reading.json** - Single sensor reading (use with SensorReading message)
- **sensor-batch.json** - Multiple sensor readings (use with SensorBatch message)

## How to Use

1. **Load a .proto file** in the web app
2. **Select the appropriate message type** from the dropdown
3. **Copy/paste JSON data** from one of the sample files
4. **Encode to binary** and download
5. **Decode the binary** to verify it works

## Testing Different Features

- **Simple types**: user.proto (strings, ints, bools)
- **Enums**: product.proto (Category enum)
- **Nested messages**: product.proto (Review), sensor.proto (Location)
- **Repeated fields**: product.proto (tags, reviews), sensor.proto (readings array)
- **Multiple message types**: Try encoding ProductCatalog vs Product separately

## Example Workflow

```
1. Upload product.proto
2. Select "Product" message type
3. Paste product.json content
4. Click "Encode to Binary"
5. Download the .pb file
6. Click "Decode Binary → JSON" tab
7. Upload the .pb file
8. Click "Decode to JSON"
9. Verify the output matches the original JSON
```
