import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Alert, Image } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import api from '../../services/api';

import {
  Container,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalsContainer,
  Title,
  TotalContainer,
  AdittionalItem,
  AdittionalItemText,
  AdittionalQuantity,
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
  ConfirmationContainer,
  ConfirmationContainerText,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  category: number;
  thumbnail_url: string;
  image_url: string;
  formattedPrice: string;
  extras: Extra[];
}

interface Order {
  product_id: number;
  name: string;
  description: string;
  price: number;
  category: number;
  thumbnail_url: string;
  extras: Extra[];
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);

  const [orderCreated, setOrderCreated] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();

  const { id: foodId } = route.params as Params;

  useEffect(() => {
    async function loadFood(): Promise<void> {
      const response = await api.get(`/foods/${foodId}`);

      const foodLoaded: Food = {
        ...response.data,
        formattedPrice: formatValue(response.data.price),
      };

      setFood(foodLoaded);
      setExtras(foodLoaded.extras.map(extra => ({ ...extra, quantity: 0 })));
    }

    loadFood();
  }, [foodId]);

  useEffect(() => {
    async function checkIsFavorite(): Promise<void> {
      try {
        await api.get(`/favorites/${food.id}`);
        setIsFavorite(true);
      } catch {
        setIsFavorite(false);
      }
    }

    checkIsFavorite();
  }, [food]);

  // const handleIncrementExtra = useCallback((id: number) => {
  //   setExtras(currentExtras => {
  //     return currentExtras.map(extra => {
  //       if (extra.id !== id) {
  //         return extra;
  //       }

  //       return {
  //         ...extra,
  //         quantity: extra.quantity + 1,
  //       };
  //     });
  //   });
  // }, []);

  function handleIncrementExtra(id: number): void {
    setExtras(currentExtras => {
      return currentExtras.map(extra => {
        if (extra.id !== id) {
          return extra;
        }

        return {
          ...extra,
          quantity: extra.quantity + 1,
        };
      });
    });
  }

  // const handleDecrementExtra = useCallback((id: number) => {
  //   setExtras(currentExtras => {
  //     return currentExtras.map(extra => {
  //       if (extra.id !== id) {
  //         return extra;
  //       }

  //       return {
  //         ...extra,
  //         quantity: extra.quantity === 0 ? 0 : extra.quantity - 1,
  //       };
  //     });
  //   });
  // }, []);

  function handleDecrementExtra(id: number): void {
    setExtras(currentExtras => {
      return currentExtras.map(extra => {
        if (extra.id !== id) {
          return extra;
        }

        return {
          ...extra,
          quantity: extra.quantity === 0 ? 0 : extra.quantity - 1,
        };
      });
    });
  }

  function handleIncrementFood(): void {
    setFoodQuantity(currentQuantity => currentQuantity + 1);
  }
  // const handleIncrementFood = useCallback(
  //   () => setFoodQuantity(currentQuantity => currentQuantity + 1),
  //   [],
  // );

  function handleDecrementFood(): void {
    setFoodQuantity(currentQuantity => {
      if (currentQuantity > 1) {
        return currentQuantity - 1;
      }

      return currentQuantity;
    });
  }
  // const handleDecrementFood = useCallback(
  //   () =>
  //     setFoodQuantity(currentQuantity => {
  //       if (currentQuantity > 1) {
  //         return currentQuantity - 1;
  //       }

  //       return currentQuantity;
  //     }),
  //   [],
  // );

  const toggleFavorite = useCallback(async () => {
    // Toggle if food is favorite or not
    if (isFavorite) {
      await api.delete(`/favorites/${food.id}`);
    } else {
      const data: Omit<Food, 'formattedPrice' | 'extras'> = food;
      await api.post('/favorites', data);
    }

    setIsFavorite(!isFavorite);
  }, [isFavorite, food]);

  const cartTotal = useMemo(() => {
    // Calculate cartTotal
    const extrasTotal = extras
      .map(extra => extra.value * extra.quantity)
      .reduce((atual, acumulador) => acumulador + atual, 0);

    const total = (extrasTotal + Number(food.price)) * foodQuantity;
    return total;
  }, [extras, food, foodQuantity]);

  const cardTotalText = useMemo(() => formatValue(cartTotal), [cartTotal]);

  async function handleFinishOrder(): Promise<void> {
    try {
      const { name, description, price, category, thumbnail_url } = food;

      const order: Order = {
        product_id: food.id,
        name,
        description,
        price,
        category,
        thumbnail_url,
        extras,
      };

      await api.post('/orders', order);
      setOrderCreated(true);
      setTimeout(() => navigation.goBack(), 2000);
    } catch {
      Alert.alert(
        'Deu ruim!',
        'Não conseguimos criar o pedido. Tente mais tarde :)',
      );
    }
  }
  // const handleFinishOrder = useCallback(async () => {
  //   try {
  //     const { name, description, price, category, thumbnail_url } = food;

  //     const order: Order = {
  //       product_id: food.id,
  //       name,
  //       description,
  //       price,
  //       category,
  //       thumbnail_url,
  //       extras,
  //     };

  //     await api.post('/orders', order);
  //     setOrderCreated(true);
  //     setTimeout(() => navigation.goBack(), 2000);
  //   } catch {
  //     Alert.alert(
  //       'Deu ruim!',
  //       'Não conseguimos criar o pedido. Tente mais tarde :)',
  //     );
  //   }
  // }, [food, extras, navigation]);

  // Calculate the correct icon name
  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <Container>
      <Header />

      <ScrollContainer>
        <FoodsContainer>
          <Food>
            <FoodImageContainer>
              <Image
                style={{ width: 327, height: 183 }}
                source={{
                  uri: food.image_url,
                }}
              />
            </FoodImageContainer>
            <FoodContent>
              <FoodTitle>{food.name}</FoodTitle>
              <FoodDescription>{food.description}</FoodDescription>
              <FoodPricing>{food.formattedPrice}</FoodPricing>
            </FoodContent>
          </Food>
        </FoodsContainer>
        <AdditionalsContainer>
          <Title>Adicionais</Title>
          {extras.map(extra => (
            <AdittionalItem key={extra.id}>
              <AdittionalItemText>{extra.name}</AdittionalItemText>
              <AdittionalQuantity>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="minus"
                  onPress={() => handleDecrementExtra(extra.id)}
                  testID={`decrement-extra-${extra.id}`}
                />
                <AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                  {extra.quantity}
                </AdittionalItemText>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="plus"
                  onPress={() => handleIncrementExtra(extra.id)}
                  testID={`increment-extra-${extra.id}`}
                />
              </AdittionalQuantity>
            </AdittionalItem>
          ))}
        </AdditionalsContainer>
        <TotalContainer>
          <Title>Total do pedido</Title>
          <PriceButtonContainer>
            <TotalPrice testID="cart-total">{cardTotalText}</TotalPrice>
            <QuantityContainer>
              <Icon
                size={15}
                color="#6C6C80"
                name="minus"
                selectable={false}
                onPress={handleDecrementFood}
                testID="decrement-food"
              />
              <AdittionalItemText testID="food-quantity">
                {foodQuantity}
              </AdittionalItemText>
              <Icon
                size={15}
                color="#6C6C80"
                name="plus"
                onPress={handleIncrementFood}
                testID="increment-food"
              />
            </QuantityContainer>
          </PriceButtonContainer>

          <FinishOrderButton onPress={() => handleFinishOrder()}>
            <ButtonText>Confirmar pedido</ButtonText>
            <IconContainer>
              <Icon name="check-square" size={24} color="#fff" />
            </IconContainer>
          </FinishOrderButton>
        </TotalContainer>
      </ScrollContainer>
      {orderCreated && (
        <ConfirmationContainer>
          <Icon name="thumbs-up" color="#39B100" size={70} />
          <ConfirmationContainerText>
            Pedido confirmado!
          </ConfirmationContainerText>
        </ConfirmationContainer>
      )}
    </Container>
  );
};

export default FoodDetails;
