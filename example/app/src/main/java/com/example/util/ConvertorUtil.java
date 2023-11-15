package com.example.util;

// source
import com.example.entity.ABC;

// destination
import com.example.response.XYZ;

public class ConvertorUtil {
  public static XYZ convert(
      ABC source) {
    XYZ destination = new XYZ();
    destination.setX(source.getA());

    destination.setY(source.getB());

    destination.setZ(String.valueOf(source.getC()));

    destination.setName(source.getName());

    destination.setAge(source.getAge());

    return destination;
  }
}
