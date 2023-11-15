package com.example.util;

import com.example.entity.ABC;
import com.example.response.XYZ;
import java.util.List;

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

  public String toString() {
    return "";
  }
}
