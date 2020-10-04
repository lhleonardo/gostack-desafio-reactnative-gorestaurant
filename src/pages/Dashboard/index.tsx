import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import Logo from '../../assets/logo-header.png';
import SearchInput from '../../components/SearchInput';

import api from '../../services/api';
import formatValue from '../../utils/formatValue';

import {
  Container,
  Header,
  FilterContainer,
  Title,
  CategoryContainer,
  CategorySlider,
  CategoryItem,
  CategoryItemTitle,
  FoodsContainer,
  FoodList,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
} from './styles';

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  thumbnail_url: string;
  formattedPrice: string;
}

interface Category {
  id: number;
  title: string;
  image_url: string;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    number | undefined
  >();

  const [typing, setTyping] = useState(false);

  const [searchValue, setSearchValue] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get<Food[]>('/foods', {
        params: {
          category_like: selectedCategory,
          name_like: searchValue,
        },
      });

      const formattedFoods = response.data.map(food => {
        const formattedPrice = formatValue(food.price);

        return {
          ...food,
          formattedPrice,
        };
      });

      setFoods(formattedFoods);
    }

    loadFoods();
  }, [selectedCategory, searchValue]);

  useEffect(() => {
    async function loadCategories(): Promise<void> {
      // Load categories from API
      const response = await api.get<Category[]>('/categories');

      setCategories(response.data);
    }

    loadCategories();
  }, []);

  const handleSelectCategory = useCallback(
    (id: number) => {
      // Select / deselect category
      if (selectedCategory && selectedCategory === id) {
        setSelectedCategory(undefined);
      } else {
        setSelectedCategory(id);
      }
    },
    [selectedCategory],
  );

  const handleNavigate = useCallback(
    async (id: number) => {
      navigation.navigate('FoodDetails', { foodId: id });
    },
    [navigation],
  );
  return (
    <Container>
      <Header typing={typing}>
        <Image source={Logo} />
        <Icon
          name="log-out"
          size={24}
          color="#FFB84D"
          onPress={() => navigation.navigate('Home')}
        />
      </Header>
      <FilterContainer>
        <SearchInput
          value={searchValue}
          onChangeText={setSearchValue}
          placeholder="Qual comida você procura?"
          onFocusEnter={() => setTyping(true)}
          onFocusExit={() => setTyping(false)}
        />
      </FilterContainer>
      <ScrollView>
        <CategoryContainer typing={typing}>
          <Title>Categorias</Title>
          <CategorySlider
            contentContainerStyle={{
              paddingHorizontal: 20,
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categories.map(category => (
              <CategoryItem
                key={category.id}
                isSelected={category.id === selectedCategory}
                onPress={() => handleSelectCategory(category.id)}
                activeOpacity={0.6}
                testID={`category-${category.id}`}
              >
                <Image
                  style={{ width: 56, height: 56 }}
                  source={{ uri: category.image_url }}
                />
                <CategoryItemTitle>{category.title}</CategoryItemTitle>
              </CategoryItem>
            ))}
          </CategorySlider>
        </CategoryContainer>
        <FoodsContainer typing={typing}>
          <Title>Pratos</Title>
          <FoodList>
            {foods.map(food => (
              <Food
                key={food.id}
                onPress={() => handleNavigate(food.id)}
                activeOpacity={0.6}
                testID={`food-${food.id}`}
              >
                <FoodImageContainer>
                  <Image
                    style={{ width: 88, height: 88 }}
                    source={{ uri: food.thumbnail_url }}
                  />
                </FoodImageContainer>
                <FoodContent>
                  <FoodTitle>{food.name}</FoodTitle>
                  <FoodDescription>{food.description}</FoodDescription>
                  <FoodPricing>{food.formattedPrice}</FoodPricing>
                </FoodContent>
              </Food>
            ))}
          </FoodList>
        </FoodsContainer>
      </ScrollView>
    </Container>
  );
};

export default Dashboard;
