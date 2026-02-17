import React from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type IconFamily = 'feather' | 'ionicons' | 'material' | 'materialCommunity';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  family?: IconFamily;
}

export default function Icon({
  name,
  size = 24,
  color = '#1A1A1A',
  family = 'feather',
}: IconProps) {
  switch (family) {
    case 'ionicons':
      return <Ionicons name={name} size={size} color={color} />;
    case 'material':
      return <MaterialIcons name={name} size={size} color={color} />;
    case 'materialCommunity':
      return <MaterialCommunityIcons name={name} size={size} color={color} />;
    case 'feather':
    default:
      return <Feather name={name} size={size} color={color} />;
  }
}
